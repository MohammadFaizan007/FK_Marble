import type { MetadataRoute } from "next";
import { withLocale } from "@/i18n/locale";
import { absoluteSiteUrl, publicCataloguePaths } from "@/lib/public-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicCataloguePaths().flatMap((path) => {
    const languages = {
      en: absoluteSiteUrl(withLocale("en", path)),
      hi: absoluteSiteUrl(withLocale("hi", path)),
      "x-default": absoluteSiteUrl(path),
    };

    return [path, withLocale("en", path), withLocale("hi", path)].map((url) => ({
      url: absoluteSiteUrl(url),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
