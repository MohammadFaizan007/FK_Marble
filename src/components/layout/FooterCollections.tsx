import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { LocaleLink } from "@/components/common/LocaleLink";
import { isLocale, localeCookieName } from "@/i18n/locale";
import { listCategories } from "@/services/product-service";

function CollectionLinks({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {categories.map((category) => (
        <li key={category.slug}>
          <LocaleLink
            href={`/categories/${category.slug}`}
            className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
          >
            {category.name}
          </LocaleLink>
        </li>
      ))}
    </ul>
  );
}

async function DynamicFooterCollections() {
  await connection();
  const saved = (await cookies()).get(localeCookieName)?.value;
  const locale = isLocale(saved) ? saved : "en";
  const categories = await listCategories(locale);

  if (!categories.ok) {
    return null;
  }

  return <CollectionLinks categories={categories.data} />;
}

export function FooterCollections() {
  return (
    <Suspense fallback={null}>
      <DynamicFooterCollections />
    </Suspense>
  );
}
