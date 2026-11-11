"use client";

import { useChrome } from "@/i18n/use-chrome";

export function SkipLink() {
  const { copy } = useChrome();

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:text-foreground"
    >
      {copy.skipToContent}
    </a>
  );
}
