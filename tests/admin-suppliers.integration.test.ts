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

  const { deleteSupplier, SupplierInUseError } = await import("../src/services/admin-suppliers");
  const { randomUUID } = await import("node:crypto");
  const removedId = await deleteSupplier(prisma, supplier.id);
  assert.equal(removedId, supplier.id);
  assert.equal(await prisma.supplier.count({ where: { id: supplier.id } }), 0);

  const kept = await createSupplier(prisma, { ...input, name: "Supplier kept" });
  const orderId = randomUUID();
  await prisma.purchaseOrder.create({
    data: { id: orderId, number: `PO-${orderId.slice(0, 8)}`, supplierId: kept.id },
  });

  await assert.rejects(() => deleteSupplier(prisma, kept.id), SupplierInUseError);
  assert.equal(await prisma.supplier.count({ where: { id: kept.id } }), 1);

  await prisma.purchaseOrder.delete({ where: { id: orderId } });
  await prisma.supplier.delete({ where: { id: kept.id } });
});
