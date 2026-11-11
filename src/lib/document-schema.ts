import { z } from "zod";

export const documentUnits = ["SQ_FT", "SQ_M", "PIECES", "SLABS", "BOXES"] as const;

export const documentUnitLabels = {
  SQ_FT: "Square feet",
  SQ_M: "Square metre",
  PIECES: "Pieces",
  SLABS: "Slabs",
  BOXES: "Boxes",
} as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const moneySchema = z.union([z.string(), z.number()]).transform((value, context) => {
  const text = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    context.addIssue({ code: "custom", message: "Enter a rate greater than zero, with up to 2 decimal places." });
    return z.NEVER;
  }

  const amount = Number(text);

  if (amount <= 0 || amount > 99999999.99) {
    context.addIssue({ code: "custom", message: "Enter a rate greater than zero, with up to 2 decimal places." });
    return z.NEVER;
  }

  return text;
});

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

const lineSchema = z.object({
  productId: recordId,
  quantity: quantitySchema,
  unit: z.enum(documentUnits, { error: "Choose a unit." }),
  rate: moneySchema,
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

const dateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, context) => {
    if (!value) {
      return null;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      context.addIssue({ code: "custom", message: "Enter a valid date." });
      return z.NEVER;
    }

    return new Date(`${value}T00:00:00.000Z`);
  });

export const quotationInputSchema = z
  .object({
    customerId: recordId,
    validUntil: dateSchema,
    notes: optionalText(500),
    terms: optionalText(500),
    items: z.array(lineSchema).min(1, "Add at least one product.").max(30),
  })
  .superRefine((value, context) => {
    rejectDuplicate(
      value.items.map((item) => item.productId),
      "Each product can appear once on the quotation.",
      context,
    );
  });

export const quotationStatusSchema = z.object({
  status: z.enum(["SENT", "ACCEPTED", "REJECTED", "EXPIRED"], { error: "Choose a quotation status." }),
});

export const invoiceInputSchema = z
  .object({
    customerId: recordId,
    quotationId: recordId.optional(),
    notes: optionalText(500),
    items: z.array(lineSchema).min(1, "Add at least one product.").max(30).optional(),
  })
  .superRefine((value, context) => {
    if (!value.quotationId && !value.items) {
      context.addIssue({ code: "custom", message: "Add at least one product." });
      return;
    }

    if (value.items) {
      rejectDuplicate(
        value.items.map((item) => item.productId),
        "Each product can appear once on the invoice.",
        context,
      );
    }
  });

export const invoiceCancelSchema = z.object({
  reason: z.string().trim().min(2, "Enter the reason for cancelling.").max(200),
});

export type QuotationInput = z.infer<typeof quotationInputSchema>;
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type DocumentLineInput = z.infer<typeof lineSchema>;
