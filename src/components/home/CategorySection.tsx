import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { CatalogueNotice } from "@/components/common/CatalogueNotice";
import { LocaleLink } from "@/components/common/LocaleLink";
import { MediaImage } from "@/components/common/MediaImage";
import { SectionHeading } from "@/components/common/SectionHeading";
import { chromeFor } from "@/i18n/chrome";
import { isLocale } from "@/i18n/locale";
import { listCategories } from "@/services/product-service";

export async function CategorySection({ params }: { params?: Promise<{ lang?: string }> }) {
  await connection();
  const lang = params ? (await params).lang : undefined;
  const locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);
  const categories = await listCategories(locale);

  return (
    <section className="scroll-mt-16 bg-background py-20 sm:scroll-mt-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Collections"
          title="Materials that inspire."
          description="Explore surfaces that combine natural beauty, durability and timeless design."
        />
        {categories.ok && categories.data.length > 0 ? (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.data.map((category) => (
              <li key={category.slug}>
                <LocaleLink
                  href={`/categories/${category.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:aspect-[4/5]"
                >
                  <MediaImage
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-center motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#24231F]/85 via-[#24231F]/15 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                    <div>
                      <h3 className="font-heading text-2xl">{category.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/75">{category.description}</p>
                    </div>
                    <span className="mb-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium tracking-[0.16em] uppercase transition-colors group-hover:text-accent">
                      {copy.buttons.explore}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </LocaleLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12">
            <CatalogueNotice
              title={copy.catalogueUnavailable}
              message={categories.ok ? copy.featuredEmptyMessage : categories.message}
            />
          </div>
        )}
      </div>
    </section>
  );
}
