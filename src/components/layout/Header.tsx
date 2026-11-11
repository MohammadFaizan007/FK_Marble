"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { LocaleLink } from "@/components/common/LocaleLink";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { mainNavigation } from "@/config/navigation";
import { useChrome } from "@/i18n/use-chrome";
import { stripLocale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { copy } = useChrome();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = mainNavigation
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (media.matches) {
        setOpen(false);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const closeMenu = () => setOpen(false);
  const barePath = stripLocale(pathname);
  const onCatalogue = barePath.startsWith("/products") || barePath.startsWith("/categories");

  function itemCurrent(id: string) {
    if (onCatalogue) {
      return id === "collections";
    }

    if (barePath !== "/") {
      return false;
    }

    return activeId === id;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <LocaleLink href="/" aria-label={copy.homeLabel} className="shrink-0" onClick={closeMenu}>
          <BrandLogo size="sm" showTagline={false} className="w-[148px] sm:w-[180px]" />
        </LocaleLink>

        <nav aria-label={copy.primaryNav} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {mainNavigation.map((item) => (
              <li key={item.id}>
                <LocaleLink
                  href={item.href}
                  aria-current={itemCurrent(item.id) ? "page" : undefined}
                  className={cn(
                    "text-xs font-medium tracking-[0.16em] uppercase transition-colors hover:text-accent",
                    itemCurrent(item.id) ? "text-accent" : "text-foreground",
                  )}
                >
                  {copy.nav[item.id]}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <WhatsAppButton className="hidden lg:inline-flex">{copy.buttons.whatsApp}</WhatsAppButton>
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex size-11 items-center justify-center text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? copy.closeMenu : copy.openMenu}</span>
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          ref={panelRef}
          id={menuId}
          aria-label={copy.mobileNav}
          className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-border bg-background px-4 py-4 sm:top-20 lg:hidden"
        >
          <ul className="flex flex-col">
            {mainNavigation.map((item) => (
              <li key={item.id}>
                <LocaleLink
                  href={item.href}
                  aria-current={itemCurrent(item.id) ? "page" : undefined}
                  onClick={closeMenu}
                  className={cn(
                    "flex min-h-12 items-center text-sm font-medium tracking-[0.14em] uppercase",
                    itemCurrent(item.id) ? "text-accent" : "text-foreground",
                  )}
                >
                  {copy.nav[item.id]}
                </LocaleLink>
              </li>
            ))}
          </ul>
          <WhatsAppButton className="mt-3 w-full" />
        </nav>
      ) : null}
    </header>
  );
}
