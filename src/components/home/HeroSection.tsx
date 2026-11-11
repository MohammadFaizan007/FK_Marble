"use client";

import { LocaleLink } from "@/components/common/LocaleLink";
import { useChrome } from "@/i18n/use-chrome";
import { MediaImage } from "@/components/common/MediaImage";
import { editorialImages } from "@/config/editorial";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  const { copy } = useChrome();

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden scroll-mt-16 sm:min-h-[calc(100svh-5rem)] sm:scroll-mt-20"
    >
      <MediaImage
        src={editorialImages.hero.src}
        alt={editorialImages.hero.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_62%]"
      />
      <div className="absolute inset-0 bg-[#24231F]/58" aria-hidden="true" />
      <div className="hero-copy relative z-10 mx-auto w-full max-w-6xl px-4 pt-16 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
          {siteConfig.name} · {siteConfig.tagline}
        </p>
        <h1 className="hero-title mt-5 max-w-4xl">
          Nature&apos;s Beauty.
          <br />
          Timeless Spaces.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
          Discover an exclusive collection of premium tiles, marble, granite and
          natural stones to transform your spaces into something extraordinary.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LocaleLink href="/products" className="btn btn-accent w-full sm:w-auto">
            {copy.buttons.exploreCollection}
          </LocaleLink>
          <a
            href="#contact"
            className="btn w-full border border-white/55 bg-transparent text-white hover:border-accent hover:text-accent sm:w-auto"
          >
            {copy.buttons.contact}
          </a>
        </div>
      </div>
    </section>
  );
}
