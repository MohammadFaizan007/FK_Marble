import assert from "node:assert/strict";
import test from "node:test";
import { goodsReceiptInputSchema, purchaseOrderInputSchema } from "../src/lib/purchase-schema";

test("a purchase order accepts quantities and rejects a repeated product", () => {
  const valid = purchaseOrderInputSchema.parse({
    supplierId: "supplier-check",
    notes: "",
    items: [{ productId: "prod-check", quantity: "2.50" }],
  });

  assert.equal(valid.items[0]?.quantity, "2.50");
  assert.equal(valid.notes, null);

  const repeated = purchaseOrderInputSchema.safeParse({
    supplierId: "supplier-check",
    items: [
      { productId: "prod-check", quantity: "1" },
      { productId: "prod-check", quantity: "1" },
    ],
  });
  const zero = goodsReceiptInputSchema.safeParse({
    lines: [{ purchaseOrderItemId: "line-check", quantity: "0" }],
  });

  assert.equal(repeated.success, false);
  assert.equal(zero.success, false);
});
