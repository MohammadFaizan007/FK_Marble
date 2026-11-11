import { z } from "zod";

export const productSortFields = ["createdAt", "name", "price"] as const;
export const sortOrders = ["asc", "desc"] as const;

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  material: z.string().trim().max(200).optional(),
  color: z.string().trim().max(200).optional(),
  finish: z.string().trim().max(200).optional(),
  size: z.string().trim().max(200).optional(),
  sortBy: z.enum(productSortFields).default("createdAt"),
  sortOrder: z.enum(sortOrders).default("desc"),
});

export type PublicProductQuery = {
  page: number;
  limit: number;
  search?: string;
  categorySlug?: string;
  materials: string[];
  colors: string[];
  finishes: string[];
  sizes: string[];
  sortBy: (typeof productSortFields)[number];
  sortOrder: (typeof sortOrders)[number];
};

export function splitList(value?: string): string[] {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function publicCategorySlug(slug?: string): string | undefined {
  if (!slug) {
    return undefined;
  }

  return slug === "other-natural-stone" ? "natural-stone" : slug;
}

export function parseProductListQuery(params: URLSearchParams): PublicProductQuery {
  const input: Record<string, string> = {};

  for (const key of ["page", "limit", "search", "category", "material", "color", "finish", "size", "sortBy", "sortOrder"]) {
    const value = params.get(key);
    if (value) {
      input[key] = value;
    }
  }

  const parsed = listSchema.parse(input);

  return {
    page: parsed.page,
    limit: parsed.limit,
    search: parsed.search || undefined,
    categorySlug: publicCategorySlug(parsed.category),
    materials: splitList(parsed.material),
    colors: splitList(parsed.color),
    finishes: splitList(parsed.finish),
    sizes: splitList(parsed.size),
    sortBy: parsed.sortBy,
    sortOrder: parsed.sortOrder,
  };
}

type StringFilter = { in: string[] };
type ContainsFilter = { contains: string; mode: "insensitive" };

export type PublicProductWhere = {
  AND: Array<Record<string, unknown>>;
};

export function publicProductWhere(query: {
  search?: string;
  categorySlug?: string;
  materials?: string[];
  colors?: string[];
  finishes?: string[];
  sizes?: string[];
} = {}): PublicProductWhere {
  const and: Array<Record<string, unknown>> = [{ isActive: true }, { isDemo: false }];

  if (query.categorySlug) {
    and.push({ category: { slug: query.categorySlug, isActive: true } });
  }

  const lists: Array<[string, string[]]> = [
    ["material", query.materials ?? []],
    ["color", query.colors ?? []],
    ["finish", query.finishes ?? []],
    ["size", query.sizes ?? []],
  ];

  for (const [field, values] of lists) {
    if (values.length > 0) {
      const filter: StringFilter = { in: values };
      and.push({ [field]: filter });
    }
  }

  if (query.search) {
    const contains: ContainsFilter = { contains: query.search, mode: "insensitive" };
    and.push({
      OR: [
        { name: contains },
        { material: contains },
        { category: { name: contains } },
      ],
    });
  }

  return { AND: and };
}

export function productOrderBy(query: Pick<PublicProductQuery, "sortBy" | "sortOrder">) {
  if (query.sortBy === "name") {
    return { name: query.sortOrder };
  }

  if (query.sortBy === "price") {
    return { price: { sort: query.sortOrder, nulls: "last" as const } };
  }

  return { createdAt: query.sortOrder };
}
