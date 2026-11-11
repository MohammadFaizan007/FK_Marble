import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";
import { PurchaseOrderStateError } from "../src/services/admin-purchases";

const configured = isDatabaseConfigured();

test(
  "receiving goods adds stock and does not store a cost",
  { skip: configured ? false : "DATABASE_URL is not configured" },
  async () => {
    const { getPrisma } = await import("../src/lib/prisma");
    const { createSupplier } = await import("../src/services/admin-suppliers");
    const { approvePurchaseOrder, createPurchaseOrder, receiveGoods } = await import("../src/services/admin-purchases");
    const { supplierInputSchema } = await import("../src/lib/supplier-schema");
    const prisma = getPrisma();
    const supplier = await createSupplier(
      prisma,
      supplierInputSchema.parse({
        name: "Purchase check supplier",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
        notes: "",
        isActive: true,
      }),
    );
    const product = await prisma.product.create({
      data: {
        id: "purchase-check-product",
        name: "Purchase check stone",
        slug: "purchase-check-stone",
        description: "Temporary product for a purchase check.",
        categoryId: "cat-tiles",
        material: "Stone",
        availability: "Confirm on enquiry",
        isActive: true,
        isDemo: false,
      },
    });

    try {
      const draft = await createPurchaseOrder(prisma, {
        supplierId: supplier.id,
        notes: null,
        items: [{ productId: product.id, quantity: "5" }],
      });

      await assert.rejects(() => receiveGoods(prisma, draft.id, { notes: null, lines: [{ purchaseOrderItemId: draft.items[0]!.id, quantity: "1" }] }), PurchaseOrderStateError);

      const approved = await approvePurchaseOrder(prisma, draft.id);
      const partial = await receiveGoods(prisma, approved.id, {
        notes: null,
        lines: [{ purchaseOrderItemId: approved.items[0]!.id, quantity: "2" }],
      });

      assert.equal(partial.status, "PARTIALLY_RECEIVED");
      assert.equal(partial.items[0]?.receivedQuantity, "2.00");
      assert.equal(partial.items[0]?.onHand, "2.00");
      assert.equal("costPrice" in partial, false);

      const received = await receiveGoods(prisma, approved.id, {
        notes: null,
        lines: [{ purchaseOrderItemId: approved.items[0]!.id, quantity: "3" }],
      });

      assert.equal(received.status, "RECEIVED");
      assert.equal(received.items[0]?.onHand, "5.00");

      await assert.rejects(
        () => receiveGoods(prisma, approved.id, { notes: null, lines: [{ purchaseOrderItemId: approved.items[0]!.id, quantity: "1" }] }),
        PurchaseOrderStateError,
      );
    } finally {
      await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
      await prisma.goodsReceiptLine.deleteMany({ where: { purchaseOrderItem: { productId: product.id } } });
      await prisma.goodsReceipt.deleteMany({ where: { purchaseOrder: { supplierId: supplier.id } } });
      await prisma.purchaseOrder.deleteMany({ where: { supplierId: supplier.id } });
      await prisma.product.delete({ where: { id: product.id } });
      await prisma.supplier.delete({ where: { id: supplier.id } });
    }
  },
);
