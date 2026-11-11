import type { PriceUnit, Product } from "@/types/product";

const priceUnitLabel: Record<PriceUnit, string> = {
  "sq-ft": "per sq. ft.",
  piece: "per piece",
  slab: "per slab",
};

export function formatProductPrice(
  product: Pick<Product, "price" | "priceUnit" | "showPrice">,
): string | null {
  if (
    !product.showPrice ||
    product.price == null ||
    !Number.isFinite(product.price) ||
    product.price <= 0
  ) {
    return null;
  }

  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);
  const unit = product.priceUnit ? ` ${priceUnitLabel[product.priceUnit]}` : "";

  return `${amount}${unit}`;
}

export function productPriceLabel(
  product: Pick<Product, "price" | "priceUnit" | "showPrice">,
): string {
  return formatProductPrice(product) ?? "Request Price";
}

export function hasListedPrice(products: readonly Product[]): boolean {
  return products.some((product) => formatProductPrice(product) !== null);
}
