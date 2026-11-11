"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { localeFromPathname, withLocale } from "@/i18n/locale";

export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const localized = typeof href === "string" ? withLocale(localeFromPathname(pathname), href) : href;

  return <Link href={localized} {...props} />;
}
