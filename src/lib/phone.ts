import { z } from "zod";

export function normalizeIndianMobile(input: string): string | null {
  const compact = input.replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return match?.[1] ?? null;
}

export function optionalIndianMobileSchema(message = "Enter a valid Indian mobile number.") {
  return z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      const mobile = normalizeIndianMobile(value);

      if (!mobile) {
        context.addIssue({ code: "custom", message });
        return z.NEVER;
      }

      return mobile;
    });
}
