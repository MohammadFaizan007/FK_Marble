import type { Product, ProductQuery, ProductSort } from "@/types/product";

function matchesSelection(
  value: string | undefined,
  selected: readonly string[] | undefined,
): boolean {
  if (!selected || selected.length === 0) {
    return true;
  }

  return value != null && selected.includes(value);
}

function compareProducts(sort: ProductSort, left: Product, right: Product): number {
  if (sort === "name-asc") {
    return left.name.localeCompare(right.name);
  }

  if (sort === "name-desc") {
    return right.name.localeCompare(left.name);
  }

  if (sort === "price-asc") {
    return (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY);
  }

  if (sort === "price-desc") {
    return (right.price ?? 0) - (left.price ?? 0);
  }

  return right.createdAt.localeCompare(left.createdAt);
}

export function queryProducts(
  products: readonly Product[],
  query: ProductQuery = {},
): Product[] {
  const search = query.search?.trim().toLowerCase() ?? "";
  const sort = query.sort ?? "newest";

  return products
    .filter((product) => {
      if (!product.isActive) {
        return false;
      }

      const haystack = `${product.name} ${product.material} ${product.categoryName}`.toLowerCase();
      const matchesSearch = search.length === 0 || haystack.includes(search);

      return (
        matchesSearch &&
        matchesSelection(product.categorySlug, query.categorySlugs) &&
        matchesSelection(product.material, query.materials) &&
        matchesSelection(product.color, query.colors) &&
        matchesSelection(product.finish, query.finishes) &&
        matchesSelection(product.size, query.sizes)
      );
    })
    .sort((left, right) => compareProducts(sort, left, right));
}

export function uniqueProductValues(
  products: readonly Product[],
  key: "material" | "color" | "finish" | "size",
): string[] {
  return [
    ...new Set(
      products
        .map((product) => product[key])
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

export function primaryProductImage(product: Product) {
  return (
    product.images.find((image) => image.isPrimary) ??
    [...product.images].sort((left, right) => left.displayOrder - right.displayOrder)[0]
  );
}
