import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const quantitySchema = z.union([z.string(), z.number()]).transform((value, context) => {
  const text = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    context.addIssue({
      code: "custom",
      message: "Enter a quantity greater than zero, with up to 2 decimal places.",
    });
    return z.NEVER;
  }

  const amount = Number(text);

  if (amount <= 0 || amount > 999999.99) {
    context.addIssue({
      code: "custom",
      message: "Enter a quantity greater than zero, with up to 2 decimal places.",
    });
    return z.NEVER;
  }

  return text;
});

const recordId = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{2,80}$/, "Choose a record.");

const orderLineSchema = z.object({
  productId: recordId,
  quantity: quantitySchema,
});

const receiptLineSchema = z.object({
  purchaseOrderItemId: recordId,
  quantity: quantitySchema,
});

export const purchaseOrderInputSchema = z
  .object({
    supplierId: recordId,
    notes: optionalText(500),
    items: z.array(orderLineSchema).min(1, "Add at least one product.").max(30),
  })
  .superRefine((value, context) => {
    const seen = new Set<string>();

    for (const item of value.items) {
      if (seen.has(item.productId)) {
        context.addIssue({ code: "custom", message: "Each product can appear once on the order." });
        return;
      }

      seen.add(item.productId);
    }
  });

export const goodsReceiptInputSchema = z
  .object({
    notes: optionalText(500),
    lines: z.array(receiptLineSchema).min(1, "Enter a received quantity.").max(30),
  })
  .superRefine((value, context) => {
    const seen = new Set<string>();

    for (const line of value.lines) {
      if (seen.has(line.purchaseOrderItemId)) {
        context.addIssue({ code: "custom", message: "Each order line can be received once on this receipt." });
        return;
      }

      seen.add(line.purchaseOrderItemId);
    }
  });

export type PurchaseOrderInput = z.infer<typeof purchaseOrderInputSchema>;
export type GoodsReceiptInput = z.infer<typeof goodsReceiptInputSchema>;
