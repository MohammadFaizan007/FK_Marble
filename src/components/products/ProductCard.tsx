"use client";

import { LocaleLink } from "@/components/common/LocaleLink";
import { useChrome } from "@/i18n/use-chrome";
import { MediaImage } from "@/components/common/MediaImage";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { primaryProductImage } from "@/lib/product-query";
import { formatProductPrice } from "@/lib/price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { copy } = useChrome();
  const photo = primaryProductImage(product);
  const details = [product.size, product.finish].filter(Boolean).join(" · ");
  const href = `/products/${product.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <LocaleLink
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
        aria-label={`${copy.buttons.viewProduct} ${product.name}`}
      >
        <MediaImage
          src={photo?.url ?? ""}
          alt={photo?.alt ?? product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]",
            product.imagePosition,
          )}
        />
      </LocaleLink>
      <div className="flex flex-1 flex-col p-5">
        {product.isDemo ? (
          <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Sample listing
          </p>
        ) : null}
        <p className="mt-3 text-xs font-medium tracking-[0.16em] text-accent uppercase">
          {product.categoryName}
        </p>
        <h3 className="mt-2 font-heading text-2xl text-foreground">
          <LocaleLink href={href} className="hover:text-accent">
            {product.name}
          </LocaleLink>
        </h3>
        <p className="mt-3 text-sm leading-6 text-foreground/80">{product.material}</p>
        {details ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{details}</p> : null}
        <p className="mt-4 text-sm font-medium tracking-wide text-accent">
          {formatProductPrice(product) ?? copy.buttons.requestPrice}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <LocaleLink href={href} className="btn btn-outline w-full">
            {copy.buttons.viewDetails}
          </LocaleLink>
          <WhatsAppButton intent="product" productName={product.name} className="w-full" />
        </div>
      </div>
    </article>
  );
}
