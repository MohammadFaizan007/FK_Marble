import "../src/lib/load-env";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { loginAdmin } from "../src/lib/admin-auth";
import { withAdminWrite } from "../src/lib/admin-guard";
import { adminSessionCookieName } from "../src/lib/admin-session";
import { isDatabaseConfigured } from "../src/lib/database";
import { hashPassword } from "../src/lib/password";

const configured = isDatabaseConfigured();

test("a staff write is refused when the role lacks permission", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const prisma = getPrisma();
  const email = `permission-test-${Date.now()}@example.com`;
  const password = `test-${randomBytes(12).toString("base64url")}`;
  const user = await prisma.adminUser.create({
    data: {
      name: "Permission Test",
      email,
      passwordHash: await hashPassword(password),
      role: "SALES",
    },
  });

  try {
    const signedIn = await loginAdmin(email, password);
    assert.equal(signedIn.ok, true);
    if (!signedIn.ok) {
      return;
    }

    const request = new Request("http://localhost/api/admin/session", {
      headers: { cookie: `${adminSessionCookieName}=${signedIn.token}` },
    });
    let writes = 0;
    const denied = await withAdminWrite(request, "product.create", async () => {
      writes += 1;
      return { value: true, audit: { action: "product.create", entityType: "Product", summary: "Created a product" } };
    });

    assert.equal(denied.ok, false);
    if (!denied.ok) {
      assert.equal(denied.status, 403);
    }
    assert.equal(writes, 0);

    const allowed = await withAdminWrite(request, "sales.create", async () => {
      return {
        value: "recorded",
        audit: {
          action: "sales.create",
          entityType: "SalesOrder",
          summary: "Recorded a sales permission check",
        },
      };
    });
    assert.equal(allowed.ok, true);
    if (allowed.ok) {
      assert.equal(allowed.value, "recorded");
    }

    const salesAudit = await prisma.auditLog.findFirst({
      where: { actorId: user.id, action: "sales.create" },
      select: { summary: true },
    });
    assert.equal(salesAudit?.summary, "Recorded a sales permission check");
  } finally {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.adminUser.delete({ where: { id: user.id } });
  }
});
