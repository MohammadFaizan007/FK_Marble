"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/locale";

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;

    return () => {
      document.documentElement.lang = previous;
    };
  }, [locale]);

  return null;
}
