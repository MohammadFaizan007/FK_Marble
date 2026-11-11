import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CatalogueNotice } from "@/components/common/CatalogueNotice";
import { LoadingState } from "@/components/common/LoadingState";
import { MediaImage } from "@/components/common/MediaImage";
import { ProductBrowser } from "@/components/products/ProductBrowser";
import { catalogueCategories } from "@/config/categories";
import { chromeFor } from "@/i18n/chrome";
import { localizedCopy } from "@/i18n/copy";
import { isLocale, type Locale } from "@/i18n/locale";
import { publicMetadata } from "@/i18n/metadata";
import { getUiCategoryBySlug, listCategories, listProducts } from "@/services/product-service";

type CategoryPageProps = {
  params: Promise<{ slug: string; lang?: string }>;
};

export function generateStaticParams() {
  return [
    ...catalogueCategories.map((category) => ({ slug: category.slug })),
    { slug: "other-natural-stone" },
  ];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);
  const category = await getUiCategoryBySlug(slug, locale);
  const fallback = catalogueCategories.find((item) => item.slug === slug);

  if (!category.ok) {
    if (!fallback) {
      return publicMetadata({ lang, path: `/categories/${slug}`, title: copy.pageNotFound, description: copy.homeDescription });
    }

    return publicMetadata({
      lang,
      path: `/categories/${fallback.slug}`,
      title: localizedCopy(locale, fallback.name, fallback.nameHi),
      description: localizedCopy(locale, fallback.description, fallback.descriptionHi),
      image: { url: fallback.image, alt: localizedCopy(locale, fallback.imageAlt, fallback.imageAltHi) },
    });
  }

  if (!category.data) {
    return publicMetadata({ lang, path: `/categories/${slug}`, title: copy.categoryNotFound, description: copy.homeDescription });
  }

  return publicMetadata({
    lang,
    path: `/categories/${category.data.slug}`,
    title: category.data.name,
    description: category.data.description,
    image: { url: category.data.image, alt: category.data.imageAlt },
  });
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense
      fallback={
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <LoadingState label="Loading this collection" />
        </main>
      }
    >
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: CategoryPageProps) {
  await connection();
  const { slug, lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);

  if (slug === "other-natural-stone") {
    redirect(isLocale(lang) ? `/${lang}/categories/natural-stone` : "/categories/natural-stone");
  }

  const known = catalogueCategories.find((category) => category.slug === slug);
  const categoryResult = await getUiCategoryBySlug(slug, locale);

  if (!categoryResult.ok && !known) {
    notFound();
  }

  if (categoryResult.ok && !categoryResult.data) {
    notFound();
  }

  const category = categoryResult.ok
    ? categoryResult.data
    : known
      ? {
          ...known,
          name: localizedCopy(locale, known.name, known.nameHi),
          description: localizedCopy(locale, known.description, known.descriptionHi),
          imageAlt: localizedCopy(locale, known.imageAlt, known.imageAltHi),
        }
      : null;

  if (!category) {
    notFound();
  }

  const [products, categories] = categoryResult.ok
    ? await Promise.all([listProducts(locale), listCategories(locale)])
    : [categoryResult, categoryResult];
  const problem = !categoryResult.ok
    ? categoryResult
    : !products.ok
      ? products
      : !categories.ok
        ? categories
        : null;
  const categoryProducts =
    products.ok && categories.ok
      ? products.data.filter((product) => product.categoryId === category.id)
      : [];

  return (
    <main id="main" className="flex-1">
      <section className="relative isolate flex min-h-72 items-end overflow-hidden bg-primary">
        <MediaImage
          src={category.image}
          alt={category.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#24231F]/58" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Breadcrumbs
            tone="inverse"
            items={[
              { label: copy.nav.home, href: "/" },
              { label: copy.products, href: "/products" },
              { label: category.name },
            ]}
          />
          <h1 className="mt-6 font-heading text-4xl text-white sm:text-5xl">{category.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">{category.description}</p>
          <p className="mt-3 text-sm text-white/75">
            {categoryResult.ok && categoryResult.data
              ? copy.productCount(categoryResult.data.productCount)
              : copy.productCountUnavailable}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.pricesNote}
        </p>
        {problem ? (
          <div className="mt-10">
            <CatalogueNotice title={copy.catalogueUnavailable} message={problem.message} />
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="mt-10">
            <CatalogueNotice
              title={copy.categoryEmptyTitle}
              message={copy.categoryEmptyMessage}
            />
          </div>
        ) : categories.ok ? (
          <ProductBrowser
            products={categoryProducts}
            categories={categories.data}
            lockedCategorySlug={category.slug}
          />
        ) : null}
      </div>
    </main>
  );
}
