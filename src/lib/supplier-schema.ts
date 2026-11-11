import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const supplierInputSchema = z.object({
  name: z.string().trim().min(2, "Enter the supplier name.").max(120),
  contactName: optionalText(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      const digits = value.replace(/\D/g, "");

      if (digits.length < 8 || digits.length > 15) {
        context.addIssue({ code: "custom", message: "Enter a phone number with 8 to 15 digits." });
        return z.NEVER;
      }

      return digits;
    }),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      const parsed = z.email().safeParse(value);

      if (!parsed.success) {
        context.addIssue({ code: "custom", message: "Enter a valid email address." });
        return z.NEVER;
      }

      return parsed.data;
    }),
  address: optionalText(240),
  gstin: z
    .string()
    .trim()
    .max(15)
    .optional()
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      const gstin = value.toUpperCase();

      if (!gstinPattern.test(gstin)) {
        context.addIssue({ code: "custom", message: "Enter a 15-character GSTIN." });
        return z.NEVER;
      }

      return gstin;
    }),
  notes: optionalText(500),
  isActive: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;
