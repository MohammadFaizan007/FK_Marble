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

const movementLineSchema = z.object({
  salesOrderItemId: recordId,
  quantity: quantitySchema,
});

function rejectDuplicate(ids: string[], message: string, context: z.RefinementCtx) {
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      context.addIssue({ code: "custom", message });
      return;
    }

    seen.add(id);
  }
}

export const salesOrderInputSchema = z
  .object({
    customerId: recordId,
    notes: optionalText(500),
    items: z.array(orderLineSchema).min(1, "Add at least one product.").max(30),
  })
  .superRefine((value, context) => {
    rejectDuplicate(
      value.items.map((item) => item.productId),
      "Each product can appear once on the order.",
      context,
    );
  });

export const salesReserveInputSchema = z
  .object({
    lines: z.array(movementLineSchema).min(1, "Enter a quantity to reserve.").max(30),
  })
  .superRefine((value, context) => {
    rejectDuplicate(
      value.lines.map((line) => line.salesOrderItemId),
      "Each order line can be reserved once in this step.",
      context,
    );
  });

export const salesDispatchInputSchema = z
  .object({
    notes: optionalText(500),
    lines: z.array(movementLineSchema).min(1, "Enter a quantity to dispatch.").max(30),
  })
  .superRefine((value, context) => {
    rejectDuplicate(
      value.lines.map((line) => line.salesOrderItemId),
      "Each order line can be dispatched once on this note.",
      context,
    );
  });

export type SalesOrderInput = z.infer<typeof salesOrderInputSchema>;
export type SalesReserveInput = z.infer<typeof salesReserveInputSchema>;
export type SalesDispatchInput = z.infer<typeof salesDispatchInputSchema>;
