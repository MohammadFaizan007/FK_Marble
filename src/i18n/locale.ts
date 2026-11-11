export const locales = ["en", "hi"] as const;

export type Locale = (typeof locales)[number];

export const localeCookieName = "fk-marble-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "hi";
}

export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : null;
}

export function stripLocale(pathname: string): string {
  const locale = localeFromPathname(pathname);

  if (!locale) {
    return pathname || "/";
  }

  const rest = pathname.slice(locale.length + 1);
  return rest.length === 0 ? "/" : rest;
}

export function withLocale(locale: Locale | null, href: string): string {
  if (!locale || !href.startsWith("/") || localeFromPathname(href)) {
    return href;
  }

  if (href.startsWith("/#")) {
    return `/${locale}${href.slice(1)}`;
  }

  if (href === "/") {
    return `/${locale}`;
  }

  return `/${locale}${href}`;
}

export function preferredLocalePath(pathname: string, cookie: string | undefined): string | null {
  if (!isLocale(cookie) || localeFromPathname(pathname)) {
    return null;
  }

  if (pathname.startsWith("/api") || pathname.startsWith("/admin")) {
    return null;
  }

  return pathname === "/" ? `/${cookie}` : `/${cookie}${pathname}`;
}
