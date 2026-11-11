import "../src/lib/load-env";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { loginAdmin, readAdminSession, revokeAdminSession } from "../src/lib/admin-auth";
import { hashSessionToken } from "../src/lib/admin-session";
import { isDatabaseConfigured } from "../src/lib/database";
import { hashPassword } from "../src/lib/password";

const configured = isDatabaseConfigured();

test("a staff session can be opened and revoked", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const prisma = getPrisma();
  const email = `auth-test-${Date.now()}@example.com`;
  const password = `test-${randomBytes(12).toString("base64url")}`;
  const user = await prisma.adminUser.create({
    data: {
      name: "Auth Test",
      email,
      passwordHash: await hashPassword(password),
      role: "SALES",
    },
  });

  try {
    const rejected = await loginAdmin(email, "not-the-real-password");
    assert.equal(rejected.ok, false);

    const signedIn = await loginAdmin(email, password);
    assert.equal(signedIn.ok, true);
    if (!signedIn.ok) {
      return;
    }

    assert.equal(signedIn.profile.role, "SALES");
    assert.equal(signedIn.profile.email, email);
    assert.notEqual(signedIn.token, hashSessionToken(signedIn.token));
    assert.equal((await readAdminSession(signedIn.token))?.id, user.id);

    await revokeAdminSession(signedIn.token);
    assert.equal(await readAdminSession(signedIn.token), null);

    const audits = await prisma.auditLog.findMany({
      where: { actorId: user.id },
      orderBy: { createdAt: "asc" },
      select: { action: true, summary: true },
    });
    assert.deepEqual(
      audits.map((entry) => entry.action),
      ["session.login", "session.logout"],
    );
    assert.equal(audits.some((entry) => entry.summary.includes(password)), false);
  } finally {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.adminUser.delete({ where: { id: user.id } });
  }
});
