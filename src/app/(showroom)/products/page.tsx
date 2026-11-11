import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CatalogueNotice } from "@/components/common/CatalogueNotice";
import { LoadingState } from "@/components/common/LoadingState";
import { ProductBrowser } from "@/components/products/ProductBrowser";
import { chromeFor } from "@/i18n/chrome";
import { isLocale } from "@/i18n/locale";
import { publicMetadata } from "@/i18n/metadata";
import { listCategories, listProducts } from "@/services/product-service";

type ProductsPageProps = {
  params?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const lang = params ? (await params).lang : undefined;
  const copy = chromeFor(isLocale(lang) ? lang : "en");

  return publicMetadata({
    lang,
    path: "/products",
    title: copy.productsTitle,
    description: copy.productsDescription,
  });
}

export default function ProductsPage({ params }: ProductsPageProps) {
  return (
    <Suspense
      fallback={
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <LoadingState label="Loading the collection" />
        </main>
      }
    >
      <ProductsCatalogue params={params} />
    </Suspense>
  );
}

async function ProductsCatalogue({ params }: ProductsPageProps) {
  await connection();
  const lang = params ? (await params).lang : undefined;
  const locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);
  const [products, categories] = await Promise.all([listProducts(locale), listCategories(locale)]);
  const problem = !products.ok ? products : !categories.ok ? categories : null;

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Breadcrumbs items={[{ label: copy.nav.home, href: "/" }, { label: copy.products }]} />
        <h1 className="mt-6 font-heading text-4xl text-foreground sm:text-5xl">{copy.productsTitle}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{copy.productsDescription}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.pricesNote}</p>
        {problem ? (
          <div className="mt-10">
            <CatalogueNotice title={copy.catalogueUnavailable} message={problem.message} />
          </div>
        ) : products.ok && categories.ok && products.data.length === 0 ? (
          <div className="mt-10">
            <CatalogueNotice title={copy.productsEmptyTitle} message={copy.productsEmptyMessage} />
          </div>
        ) : products.ok && categories.ok ? (
          <ProductBrowser products={products.data} categories={categories.data} />
        ) : null}
      </div>
    </main>
  );
}
