import "../src/lib/load-env";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";

const configured = isDatabaseConfigured();

test("a sales order reserves free stock and dispatch reduces the quantity on hand", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { CustomerInUseError, createCustomer, deleteCustomer } = await import("../src/services/admin-customers");
  const {
    SalesOrderStateError,
    approveSalesOrder,
    createSalesOrder,
    dispatchSalesGoods,
    getSalesOrder,
    reserveSalesGoods,
  } = await import("../src/services/admin-sales");
  const { customerInputSchema } = await import("../src/lib/customer-schema");
  const prisma = getPrisma();
  const productId = `sales-check-${Date.now()}`;
  const customer = await createCustomer(
    prisma,
    customerInputSchema.parse({
      name: "Sales check customer",
      type: "RETAIL",
      phone: "9045760027",
      isActive: true,
    }),
  );
  await prisma.product.create({
    data: {
      id: productId,
      name: "Sales check stone",
      slug: productId,
      description: "A temporary staff record.",
      categoryId: "cat-tiles",
      material: "Ceramic",
      availability: "Confirm on enquiry",
      isActive: true,
      isDemo: false,
    },
  });
  const movementId = randomUUID();
  await prisma.stockMovement.create({
    data: { id: movementId, productId, type: "PURCHASE_RECEIPT", quantity: "5.00" },
  });
  let orderId = "";

  try {
    const draft = await createSalesOrder(prisma, {
      customerId: customer.id,
      notes: null,
      items: [{ productId, quantity: "4.00" }],
    });
    orderId = draft.id;
    assert.equal("costPrice" in draft, false);
    const lineId = draft.items[0]?.id ?? "";
    await assert.rejects(() => reserveSalesGoods(prisma, orderId, { lines: [{ salesOrderItemId: lineId, quantity: "1.00" }] }), SalesOrderStateError);
    await approveSalesOrder(prisma, orderId);
    await assert.rejects(() => reserveSalesGoods(prisma, orderId, { lines: [{ salesOrderItemId: lineId, quantity: "6.00" }] }), SalesOrderStateError);
    const reserved = await reserveSalesGoods(prisma, orderId, { lines: [{ salesOrderItemId: lineId, quantity: "4.00" }] });
    assert.equal(reserved.status, "RESERVED");
    assert.equal(reserved.items[0]?.available, "1.00");
    const partial = await dispatchSalesGoods(prisma, orderId, { notes: null, lines: [{ salesOrderItemId: lineId, quantity: "1.00" }] });
    assert.equal(partial.status, "PARTIALLY_DISPATCHED");
    const done = await dispatchSalesGoods(prisma, orderId, { notes: null, lines: [{ salesOrderItemId: lineId, quantity: "3.00" }] });
    assert.equal(done.status, "DISPATCHED");
    assert.equal(done.items[0]?.dispatchedQuantity, "4.00");
    const onHand = await prisma.stockMovement.aggregate({ where: { productId }, _sum: { quantity: true } });
    assert.equal(onHand._sum.quantity?.toFixed(2), "1.00");
    await assert.rejects(() => deleteCustomer(prisma, customer.id), CustomerInUseError);
    const stored = await getSalesOrder(prisma, orderId);
    assert.equal(stored?.status, "DISPATCHED");
  } finally {
    await prisma.stockMovement.deleteMany({ where: { productId } });
    if (orderId) {
      await prisma.dispatchLine.deleteMany({ where: { salesOrderItem: { salesOrderId: orderId } } });
      await prisma.dispatchNote.deleteMany({ where: { salesOrderId: orderId } });
      await prisma.salesOrder.deleteMany({ where: { id: orderId } });
    }
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.customer.deleteMany({ where: { id: customer.id } });
  }
});
