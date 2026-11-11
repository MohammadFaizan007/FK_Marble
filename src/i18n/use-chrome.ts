"use client";

import { usePathname } from "next/navigation";
import { chromeFor, type Chrome } from "@/i18n/chrome";
import { localeFromPathname, type Locale } from "@/i18n/locale";

export function useChrome(): { locale: Locale; copy: Chrome } {
  const locale = localeFromPathname(usePathname()) ?? "en";
  return { locale, copy: chromeFor(locale) };
}
