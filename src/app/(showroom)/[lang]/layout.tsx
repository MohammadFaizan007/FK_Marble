import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { HtmlLang } from "@/components/common/HtmlLang";
import { isLocale, locales, type Locale } from "@/i18n/locale";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <LocaleMarker params={params} />
      </Suspense>
      {children}
    </>
  );
}

async function LocaleMarker({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  return <LocaleDocument locale={lang} />;
}

function LocaleDocument({ locale }: { locale: Locale }) {
  return (
    <div lang={locale} className="contents">
      <HtmlLang locale={locale} />
    </div>
  );
}
