import { chromeFor } from "@/i18n/chrome";
import type { Locale } from "@/i18n/locale";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";

type RelatedProductsProps = {
  products: Product[];
  locale?: Locale;
};

export function RelatedProducts({ products, locale = "en" }: RelatedProductsProps) {
  const copy = chromeFor(locale);
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-12">
      <h2 id="related-heading" className="font-heading text-3xl text-foreground">
        {copy.related}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {copy.relatedNote}
      </p>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
