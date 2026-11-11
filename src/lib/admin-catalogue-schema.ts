import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const money = z
  .union([z.literal(""), z.null(), z.string().trim()])
  .optional()
  .transform((value, context) => {
    if (value == null || value === "") {
      return null;
    }

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
      context.addIssue({ code: "custom", message: "Enter a price with up to two decimal places." });
      return z.NEVER;
    }

    return value;
  });

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Enter the category name.").max(80),
  nameHi: optionalText(80),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug using letters and numbers.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().min(2, "Enter a description.").max(500),
  descriptionHi: optionalText(500),
  image: z
    .string()
    .trim()
    .min(1, "Choose an image from your computer.")
    .max(500)
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), "Choose an image from your computer."),
  displayOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name.").max(120),
  nameHi: optionalText(120),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug using letters and numbers.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().min(2, "Enter a description.").max(2000),
  descriptionHi: optionalText(2000),
  categoryId: z.string().trim().min(1, "Choose a category."),
  material: z.string().trim().min(2, "Enter the material.").max(80),
  materialHi: optionalText(80),
  size: optionalText(40),
  thickness: optionalText(40),
  finish: optionalText(40),
  finishHi: optionalText(40),
  color: optionalText(40),
  colorHi: optionalText(40),
  usage: optionalText(80),
  usageHi: optionalText(80),
  availability: z.string().trim().min(2, "Enter availability.").max(80),
  availabilityHi: optionalText(80),
  price: money,
  wholesalePrice: money,
  costPrice: money,
  priceUnit: z.enum(["SQ_FT", "PIECE", "SLAB", ""]).optional().transform((value) => (value ? value : null)),
  showPrice: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  isDemo: z.boolean(),
});

export const imageInputSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), "Enter an image address."),
  altText: z.string().trim().min(2, "Enter a description of the image.").max(160),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
