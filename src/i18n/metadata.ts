import type { Metadata } from "next";
import { isLocale, withLocale, type Locale } from "@/i18n/locale";
import { absoluteSiteUrl } from "@/lib/public-routes";

type PublicMetadataOptions = {
  lang?: string;
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  image?: { url: string; alt: string };
};

export function publicMetadata({
  lang,
  path,
  title,
  description,
  absoluteTitle = false,
  image,
}: PublicMetadataOptions): Metadata {
  const locale: Locale = isLocale(lang) ? lang : "en";
  const canonical = isLocale(lang) ? withLocale(locale, path) : path;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        en: absoluteSiteUrl(withLocale("en", path)),
        hi: absoluteSiteUrl(withLocale("hi", path)),
        "x-default": absoluteSiteUrl(path),
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      type: "website",
      images: image ? [image] : undefined,
    },
  };
}
