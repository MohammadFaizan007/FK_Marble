"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

export function MediaImage({
  src,
  alt,
  className,
  fill = false,
  priority = false,
  sizes,
  width = 1600,
  height = 1200,
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} Image unavailable.`}
        className={cn("bg-muted", fill && "absolute inset-0", className)}
      />
    );
  }

  const remote = src.startsWith("http://") || src.startsWith("https://");

  if (src.endsWith(".svg") || remote) {
    return (
      // SVG artwork and future hosted URLs stay outside the image optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(fill && "absolute inset-0 h-full w-full", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
