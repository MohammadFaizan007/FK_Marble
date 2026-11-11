import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";

const configured = isDatabaseConfigured();

test("dashboard counts come from stored rows", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getAdminDashboardCounts } = await import("../src/services/admin-dashboard");
  const counts = await getAdminDashboardCounts();

  assert.equal(counts.publicProducts, 0);
  assert.ok(counts.activeCategories >= 6);
  assert.ok(counts.demoProducts >= 1);
  assert.ok(counts.enquiries >= counts.pendingEnquiries);
  assert.ok(counts.pendingEnquiries >= 0);
  assert.ok(counts.activeStaff >= 1);
  assert.ok(counts.suppliers >= 0);
});
