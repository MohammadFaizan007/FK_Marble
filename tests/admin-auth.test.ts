import assert from "node:assert/strict";
import test from "node:test";
import { createOwnerAccount, loginSchema } from "../src/lib/admin-auth";
import {
  clearSessionCookieHeader,
  createSessionToken,
  hashSessionToken,
  readSessionToken,
  sessionCookieHeader,
} from "../src/lib/admin-session";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { POST as login } from "../src/app/api/admin/login/route";
import { POST as loginV1 } from "../src/app/api/v1/admin/login/route";
import { POST as logout } from "../src/app/api/admin/logout/route";
import { POST as logoutV1 } from "../src/app/api/v1/admin/logout/route";
import { GET as session } from "../src/app/api/admin/session/route";
import { GET as sessionV1 } from "../src/app/api/v1/admin/session/route";

test("passwords are stored as a scrypt hash", async () => {
  const password = "a-long-test-password";
  const stored = await hashPassword(password);

  assert.equal(stored.startsWith("scrypt$"), true);
  assert.equal(stored.includes(password), false);
  assert.equal(await verifyPassword(password, stored), true);
  assert.equal(await verifyPassword("different-password", stored), false);
});

test("session cookies keep the raw token on the browser only", () => {
  const token = createSessionToken();
  const header = sessionCookieHeader(token, new Date("2026-11-11T00:00:00.000Z"));

  assert.equal(header.includes("HttpOnly"), true);
  assert.equal(header.includes("SameSite=Lax"), true);
  assert.equal(hashSessionToken(token) === token, false);
  assert.equal(
    readSessionToken(new Request("http://localhost/api/admin/session", { headers: { cookie: header } })),
    token,
  );
  assert.equal(clearSessionCookieHeader().includes("Max-Age=0"), true);
});

test("owner setup rejects a short password before saving", async () => {
  const result = await createOwnerAccount({
    name: "FK Marble Owner",
    email: "owner@example.com",
    password: "short",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.message, /12 characters/);
  }
});

test("login validation rejects an empty password", () => {
  const result = loginSchema.safeParse({ email: "owner@example.com", password: "" });
  assert.equal(result.success, false);
});

test("versioned admin session routes use the same handlers", () => {
  assert.equal(loginV1, login);
  assert.equal(logoutV1, logout);
  assert.equal(sessionV1, session);
});
