import { z } from "zod";
import { chromeFor } from "@/i18n/chrome";
import type { Locale } from "@/i18n/locale";

export const quantityUnits = ["SQ_FT", "SQ_M", "PIECES", "SLABS", "BOXES"] as const;
export const enquiryTypes = ["WHOLESALE", "RETAIL"] as const;

export const quantityUnitLabels = {
  SQ_FT: "Square Feet",
  SQ_M: "Square Meter",
  PIECES: "Pieces",
  SLABS: "Slabs",
  BOXES: "Boxes",
} as const;

export function normalizeIndianMobile(input: string): string | null {
  const compact = input.replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return match?.[1] ?? null;
}

const emptyToNull = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
};

export function enquirySchemaFor(locale: Locale = "en") {
  const text = chromeFor(locale).validation;

  return z.object({
    customerName: z.string().trim().min(2, text.name).max(80, text.nameLength),
    phone: z
      .string()
      .trim()
      .refine((value) => normalizeIndianMobile(value) !== null, text.phone)
      .transform((value) => normalizeIndianMobile(value) ?? value),
    email: z.preprocess(emptyToNull, z.email(text.email).nullable().optional()),
    productId: z.preprocess(emptyToNull, z.string().trim().min(1).max(80).nullable().optional()),
    productName: z.preprocess(emptyToNull, z.string().trim().max(160).nullable().optional()),
    enquiryType: z.enum(enquiryTypes, { error: text.enquiryType }),
    quantity: z.number().positive(text.quantity).max(1_000_000, text.quantitySize),
    quantityUnit: z.enum(quantityUnits, { error: text.unit }),
    message: z.preprocess(emptyToNull, z.string().trim().max(1000, text.messageLength).nullable().optional()),
  });
}

export const enquirySchema = enquirySchemaFor("en");

export type EnquiryInput = z.infer<typeof enquirySchema>;
