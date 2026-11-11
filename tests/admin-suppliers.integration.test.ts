import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";
import { supplierInputSchema } from "../src/lib/supplier-schema";

const configured = isDatabaseConfigured();

test("a supplier can be stored without a balance", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { createSupplier } = await import("../src/services/admin-suppliers");
  const prisma = getPrisma();
  const input = supplierInputSchema.parse({
    name: "Supplier check",
    contactName: "Showroom desk",
    phone: "9045760027",
    email: "desk@example.com",
    address: "Etawah",
    gstin: "",
    notes: "Temporary supplier record.",
    isActive: true,
  });
  const supplier = await createSupplier(prisma, input);

  assert.equal(supplier.name, "Supplier check");
  assert.equal(supplier.gstin, null);
  assert.equal("openingBalance" in supplier, false);

  await prisma.auditLog.deleteMany({ where: { entityId: supplier.id } });
  await prisma.supplier.delete({ where: { id: supplier.id } });
});
