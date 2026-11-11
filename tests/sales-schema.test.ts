import assert from "node:assert/strict";
import test from "node:test";
import { salesOrderInputSchema } from "../src/lib/sales-schema";

test("a sales order accepts one quantity line", () => {
  const parsed = salesOrderInputSchema.parse({
    customerId: "customer-1",
    items: [{ productId: "prod-1", quantity: "2.50" }],
  });

  assert.equal(parsed.items[0]?.quantity, "2.50");
});

test("a sales order rejects a repeated product and a zero quantity", () => {
  const duplicate = salesOrderInputSchema.safeParse({
    customerId: "customer-1",
    items: [
      { productId: "prod-1", quantity: "1" },
      { productId: "prod-1", quantity: "2" },
    ],
  });
  const zero = salesOrderInputSchema.safeParse({
    customerId: "customer-1",
    items: [{ productId: "prod-1", quantity: "0" }],
  });

  assert.equal(duplicate.success, false);
  assert.equal(zero.success, false);
});
