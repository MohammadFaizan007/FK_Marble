import { connection } from "next/server";
import { CatalogueNotice } from "@/components/common/CatalogueNotice";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCard } from "@/components/products/ProductCard";
import { featuredProductsNote } from "@/config/featured-products";
import { chromeFor } from "@/i18n/chrome";
import { isLocale } from "@/i18n/locale";
import { listFeaturedProducts } from "@/services/product-service";

export async function FeaturedProducts({ params }: { params?: Promise<{ lang?: string }> }) {
  await connection();
  const lang = params ? (await params).lang : undefined;
  const locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);
  const featured = await listFeaturedProducts(locale);

  return (
    <section
      id="featured"
      className="scroll-mt-16 border-t border-border bg-surface py-20 sm:scroll-mt-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Selection"
          title="Explore Our Featured Collection"
          description={featuredProductsNote}
        />
        {featured.ok && featured.data.length > 0 ? (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12">
            <CatalogueNotice
              title={featured.ok ? copy.featuredEmptyTitle : copy.catalogueUnavailable}
              message={featured.ok ? copy.featuredEmptyMessage : featured.message}
            />
          </div>
        )}
      </div>
    </section>
  );
}
