import type { Metadata } from "next";
import { LocaleLink } from "@/components/common/LocaleLink";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CatalogueNotice } from "@/components/common/CatalogueNotice";
import { LoadingState } from "@/components/common/LoadingState";
import { ProductEnquiry } from "@/components/products/ProductEnquiry";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductSpecifications } from "@/components/products/ProductSpecifications";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { sampleProducts } from "@/config/products";
import { formatProductPrice } from "@/lib/price";
import { primaryProductImage } from "@/lib/product-query";
import { chromeFor } from "@/i18n/chrome";
import { isLocale } from "@/i18n/locale";
import { publicMetadata } from "@/i18n/metadata";
import { getUiProductBySlug, listRelatedProducts } from "@/services/product-service";

type ProductPageProps = {
  params: Promise<{ slug: string; lang?: string }>;
};

export function generateStaticParams() {
  return sampleProducts
    .filter((product) => product.isActive)
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);
  const result = await getUiProductBySlug(slug, locale);

  if (!result.ok) {
    return publicMetadata({
      lang,
      path: `/products/${slug}`,
      title: copy.catalogueUnavailable,
      description: copy.homeDescription,
    });
  }

  if (!result.data) {
    return publicMetadata({
      lang,
      path: `/products/${slug}`,
      title: copy.productNotFound,
      description: copy.homeDescription,
    });
  }

  const image = primaryProductImage(result.data);

  return publicMetadata({
    lang,
    path: `/products/${result.data.slug}`,
    title: result.data.name,
    description: result.data.description,
    image: image ? { url: image.url, alt: image.alt } : undefined,
  });
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <LoadingState label="Loading product" />
        </main>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: ProductPageProps) {
  await connection();
  const { slug, lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const copy = chromeFor(locale);
  const result = await getUiProductBySlug(slug, locale);

  if (!result.ok) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <CatalogueNotice title={copy.catalogueUnavailable} message={result.message} />
      </main>
    );
  }

  if (!result.data) {
    notFound();
  }

  const product = result.data;
  const related = await listRelatedProducts(product, 3, locale);
  const price = formatProductPrice(product);

  return (
    <main id="main" className="flex-1">
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Breadcrumbs
          items={[
            { label: copy.nav.home, href: "/" },
            { label: copy.products, href: "/products" },
            { label: product.categoryName, href: `/categories/${product.categorySlug}` },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
          <ProductGallery images={product.images} productName={product.name} />
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
              <LocaleLink href={`/categories/${product.categorySlug}`} className="hover:underline">
                {product.categoryName}
              </LocaleLink>
            </p>
            <h1 className="mt-3 font-heading text-4xl text-foreground sm:text-5xl">{product.name}</h1>
            <p className="mt-5 text-base leading-7 text-foreground/85">{product.description}</p>
            <p className="mt-6 text-sm font-medium tracking-wide text-accent">
              {price ?? copy.buttons.requestPrice}
            </p>
            <div className="mt-6">
              <a href="#product-enquiry" className="btn btn-primary">
                {copy.buttons.requestPrice}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <ProductSpecifications product={product} locale={locale} />
        </div>
        <div className="mt-12">
          <ProductEnquiry product={product} />
        </div>
        {related.ok ? <RelatedProducts products={related.data} locale={locale} /> : null}
      </article>
    </main>
  );
}
