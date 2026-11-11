import { chromeFor } from "@/i18n/chrome";
import type { Locale } from "@/i18n/locale";
import { formatProductPrice } from "@/lib/price";
import type { Product } from "@/types/product";

type ProductSpecificationsProps = {
  product: Product;
  locale?: Locale;
};

export function ProductSpecifications({ product, locale = "en" }: ProductSpecificationsProps) {
  const copy = chromeFor(locale);
  const price = formatProductPrice(product);
  const rows = [
    [copy.specs.material, product.material],
    [copy.specs.size, product.size],
    [copy.specs.thickness, product.thickness],
    [copy.specs.finish, product.finish],
    [copy.specs.color, product.color],
    [copy.specs.usage, product.usage],
    [copy.specs.availability, product.availability],
    [copy.specs.price, price ?? undefined],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <section aria-labelledby="specifications-heading">
      <h2 id="specifications-heading" className="font-heading text-3xl text-foreground">
        {copy.specs.heading}
      </h2>
      <dl className="mt-5 divide-y divide-border rounded-lg border border-border bg-surface">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
