"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, localeFromPathname, stripLocale, withLocale, type Locale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

const options: Array<{ locale: Locale; label: string }> = [
  { locale: "en", label: "EN" },
  { locale: "hi", label: "हिन्दी" },
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const current = localeFromPathname(pathname) ?? "en";

  function choose(locale: Locale) {
    if (locale === current && localeFromPathname(pathname)) {
      return;
    }

    document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const hash = window.location.hash;
    router.push(`${withLocale(locale, stripLocale(pathname))}${hash}`);
  }

  return (
    <div role="group" aria-label="Language" className="flex items-center gap-2">
      {options.map((option) => (
        <button
          key={option.locale}
          type="button"
          aria-pressed={current === option.locale}
          onClick={() => choose(option.locale)}
          className={cn(
            "text-xs font-medium tracking-[0.14em] uppercase",
            option.locale === "hi" && "font-[family-name:var(--font-devanagari)] tracking-normal normal-case",
            current === option.locale ? "text-accent" : "text-muted-foreground",
          )}
          lang={option.locale}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
