import { z } from "zod";
import { optionalIndianMobileSchema } from "@/lib/phone";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const customerTypes = ["RETAIL", "WHOLESALE", "CONTRACTOR", "BUILDER", "ARCHITECT", "WALK_IN"] as const;

export const customerTypeLabels = {
  RETAIL: "Retail",
  WHOLESALE: "Wholesale",
  CONTRACTOR: "Contractor",
  BUILDER: "Builder",
  ARCHITECT: "Architect",
  WALK_IN: "Walk-in",
} as const;

export const customerInputSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer name.").max(120),
  type: z.enum(customerTypes, { error: "Choose a customer type." }),
  contactName: optionalText(80),
  phone: optionalIndianMobileSchema(),
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
    .max(24)
    .optional()
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      const gstin = value.toUpperCase().replace(/[\s-]/g, "");

      if (!gstinPattern.test(gstin)) {
        context.addIssue({ code: "custom", message: "Enter a 15-character GSTIN." });
        return z.NEVER;
      }

      return gstin;
    }),
  notes: optionalText(500),
  isActive: z.boolean(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
