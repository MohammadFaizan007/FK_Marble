import type { ReactNode } from "react";
import type { AdminRole } from "@/generated/prisma/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import type { AdminProfile } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/permissions";

const roleLabels: Record<AdminRole, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  SALES: "Sales",
  PURCHASE: "Purchase",
  INVENTORY: "Inventory",
  ACCOUNTANT: "Accountant",
};

const quietButton =
  "inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground hover:border-accent";

export function AdminBar({
  profile,
  title,
  children,
}: {
  profile: AdminProfile;
  title: string;
  children: ReactNode;
}) {
  const links = [
    ...(hasPermission(profile.role, "product.view")
      ? [
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/categories", label: "Categories" },
          { href: "/admin/products", label: "Products" },
        ]
      : []),
    ...(hasPermission(profile.role, "supplier.view") ? [{ href: "/admin/suppliers", label: "Suppliers" }] : []),
  ];

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-primary text-primary-foreground md:flex">
        <div className="px-5 pt-7 pb-6">
          <p className="font-heading text-[1.7rem] leading-none">FK Marble</p>
          <p className="mt-2 text-[0.68rem] tracking-[0.22em] text-accent uppercase">Stone & Surfaces</p>
        </div>
        <AdminNav links={links} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href="/" className={quietButton}>
              Website
            </a>
            <SignOutButton className={quietButton} />
          </div>
        </header>
        <div className="border-b border-border bg-surface px-4 py-3 md:hidden">
          <AdminNav links={links} compact />
        </div>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl text-foreground">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={
        on
          ? "inline-flex rounded-full bg-[#E7F3EA] px-2.5 py-1 text-xs font-medium text-[#1F6B3A]"
          : "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
      }
    >
      {on ? onLabel : offLabel}
    </span>
  );
}
