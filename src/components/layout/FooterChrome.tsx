"use client";

import { LocaleLink } from "@/components/common/LocaleLink";
import { mainNavigation } from "@/config/navigation";
import { useChrome } from "@/i18n/use-chrome";

export function FooterIntro() {
  const { copy } = useChrome();

  return <p className="mt-4 text-sm leading-6 text-primary-foreground/75">{copy.homeDescription}</p>;
}

export function FooterExplore() {
  const { copy } = useChrome();

  return (
    <nav aria-label={copy.footerNav}>
      <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">{copy.footer.explore}</p>
      <ul className="mt-4 space-y-3">
        {mainNavigation.map((item) => (
          <li key={item.id}>
            <LocaleLink
              href={item.href}
              className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
            >
              {copy.nav[item.id]}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function FooterHeading({ name }: { name: "collections" | "showroom" }) {
  const { copy } = useChrome();

  return (
    <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">{copy.footer[name]}</p>
  );
}

export function FooterRights() {
  const { copy } = useChrome();
  return <>{copy.footer.rights}</>;
}
