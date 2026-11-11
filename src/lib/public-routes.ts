import { catalogueCategories } from "@/config/categories";

const localSiteUrl = "http://localhost:3000";

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    return localSiteUrl;
  }

  return configured.replace(/\/$/, "");
}

export function publicCataloguePaths(): string[] {
  return ["/", "/products", ...catalogueCategories.map((category) => `/categories/${category.slug}`)];
}

export function absoluteSiteUrl(path: string): string {
  if (path === "/") {
    return siteOrigin();
  }

  return `${siteOrigin()}${path}`;
}
