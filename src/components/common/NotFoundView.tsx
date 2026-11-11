"use client";

import { LocaleLink } from "@/components/common/LocaleLink";
import { useChrome } from "@/i18n/use-chrome";

export function NotFoundView() {
  const { copy } = useChrome();

  return (
    <main id="main" className="flex flex-1 items-center">
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">FK Marble</p>
        <h1 className="mt-4 font-heading text-4xl text-foreground sm:text-5xl">{copy.pageNotFound}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.pageNotFoundMessage}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <LocaleLink href="/" className="btn btn-primary">
            {copy.buttons.home}
          </LocaleLink>
          <LocaleLink href="/products" className="btn btn-outline">
            {copy.buttons.exploreCollections}
          </LocaleLink>
        </div>
      </div>
    </main>
  );
}
