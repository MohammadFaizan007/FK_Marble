import assert from "node:assert/strict";
import test from "node:test";
import { adminPermissions, canGrant, hasPermission } from "../src/lib/permissions";

test("the owner holds every permission", () => {
  for (const permission of adminPermissions) {
    assert.equal(hasPermission("OWNER", permission), true);
    assert.equal(canGrant("OWNER", permission), true);
  }
});

test("sales staff cannot create products or grant access", () => {
  assert.equal(hasPermission("SALES", "product.view"), true);
  assert.equal(hasPermission("SALES", "sales.create"), true);
  assert.equal(hasPermission("SALES", "product.create"), false);
  assert.equal(hasPermission("SALES", "cost.view"), false);
  assert.equal(hasPermission("SALES", "user.manage"), false);
  assert.equal(hasPermission("SALES", "supplier.view"), false);
  assert.equal(hasPermission("PURCHASE", "supplier.update"), true);
  assert.equal(canGrant("SALES", "product.view"), false);
});

test("an administrator cannot grant permissions", () => {
  assert.equal(hasPermission("ADMIN", "product.create"), true);
  assert.equal(hasPermission("ADMIN", "user.manage"), false);
  assert.equal(canGrant("ADMIN", "product.create"), false);
});
