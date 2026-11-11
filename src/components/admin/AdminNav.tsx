"use client";

import { usePathname } from "next/navigation";

type AdminLink = {
  href: string;
  label: string;
};

function isCurrent(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ href }: { href: string }) {
  const common = "size-4 shrink-0";

  if (href === "/admin") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/categories")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M4 6h7v5H4zm9 0h7v5h-7zM4 13h7v5H4zm9 0h7v5h-7z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/purchases")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M6 7h12v12H6zM9 7V5h6v2M8 12h8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/customers")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12zm-7 8v-1.5A4.5 4.5 0 0 1 9.5 14h5a4.5 4.5 0 0 1 4.5 4.5V20" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/quotations")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/invoices")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21zM9 8h6M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/sales")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M6 7h12l-1 12H7zM9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/products")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M4 7h16v12H4zM8 7V5h8v2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
      <path d="M4 18V8l8-4 8 4v10H4zm8-8v8" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function AdminNav({ links, compact = false }: { links: readonly AdminLink[]; compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className={compact ? "flex gap-2 overflow-x-auto" : "flex flex-1 flex-col gap-1 px-3 pb-6"}>
      {links.map((link) => {
        const current = isCurrent(pathname, link.href);

        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={
              compact
                ? current
                  ? "shrink-0 rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                  : "shrink-0 rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
                : current
                  ? "flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground"
                  : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#E7E2D9] hover:bg-white/10"
            }
          >
            {compact ? null : <NavIcon href={link.href} />}
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
