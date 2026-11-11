import {
  siteConfig,
  type ProductCategory,
  type ProductCategorySlug,
} from "@/config/site";

const categoriesBySlug = new Map<string, ProductCategory>(
  siteConfig.categories.map((category) => [category.slug, category]),
);

export function getCategories(): readonly ProductCategory[] {
  return siteConfig.categories;
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return categoriesBySlug.get(slug);
}

export function isProductCategorySlug(
  slug: string,
): slug is ProductCategorySlug {
  return categoriesBySlug.has(slug);
}

export function getCategoryPath(slug: ProductCategorySlug): string {
  const routeSlug = slug === "other-natural-stone" ? "natural-stone" : slug;

  return `/categories/${routeSlug}`;
}
