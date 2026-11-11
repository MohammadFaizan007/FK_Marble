"use client";

import { useRef, useState } from "react";
import { MediaImage } from "@/components/common/MediaImage";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const ordered = [...images].sort((left, right) => left.displayOrder - right.displayOrder);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const current = ordered[index] ?? ordered[0];

  function show(next: number) {
    if (ordered.length === 0) {
      return;
    }

    const wrapped = (next + ordered.length) % ordered.length;
    setIndex(wrapped);
  }

  function onTouchEnd(clientX: number) {
    if (touchStart.current == null) {
      return;
    }

    const delta = clientX - touchStart.current;
    if (delta > 40) {
      show(index - 1);
    } else if (delta < -40) {
      show(index + 1);
    }
    touchStart.current = null;
  }

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const clientX = event.changedTouches[0]?.clientX;
          if (clientX != null) {
            onTouchEnd(clientX);
          }
        }}
      >
        <MediaImage
          src={current?.url ?? ""}
          alt={current?.alt ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {ordered.length > 0 ? `Image ${index + 1} of ${ordered.length}` : "Image unavailable"}
        </p>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setOpen(true)}
          disabled={!current}
        >
          View full size
        </button>
      </div>
      {ordered.length > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {ordered.map((image, imageIndex) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                aria-label={`Show image ${imageIndex + 1}: ${image.alt}`}
                aria-current={imageIndex === index ? "true" : undefined}
                className={cn(
                  "relative size-16 overflow-hidden rounded-md border bg-muted sm:size-20",
                  imageIndex === index ? "border-accent" : "border-border",
                )}
                onClick={() => setIndex(imageIndex)}
              >
                <MediaImage src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && current ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close full size image"
            onClick={() => setOpen(false)}
          />
          <div role="dialog" aria-modal="true" aria-label={`${productName} full size image`} className="relative z-10 w-full max-w-5xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <MediaImage
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button type="button" className="btn btn-accent" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
