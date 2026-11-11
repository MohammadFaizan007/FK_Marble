import type { AdminRole } from "@/generated/prisma/client";

export const adminPermissions = [
  "product.view",
  "product.create",
  "product.update",
  "product.archive",
  "price.view",
  "price.update",
  "cost.view",
  "stock.view",
  "stock.adjust",
  "purchase.create",
  "purchase.approve",
  "supplier.view",
  "supplier.update",
  "sales.create",
  "sales.approve",
  "invoice.issue",
  "payment.record",
  "expense.record",
  "report.view",
  "audit.view",
  "user.manage",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];

const staffOperations = adminPermissions.filter((permission) => permission !== "user.manage");

const roleGrants = {
  OWNER: adminPermissions,
  ADMIN: staffOperations,
  MANAGER: [
    "product.view",
    "product.create",
    "product.update",
    "price.view",
    "price.update",
    "stock.view",
    "purchase.create",
    "supplier.view",
    "supplier.update",
    "sales.create",
    "report.view",
  ],
  SALES: ["product.view", "price.view", "stock.view", "sales.create"],
  PURCHASE: ["product.view", "price.view", "stock.view", "purchase.create", "supplier.view", "supplier.update"],
  INVENTORY: ["product.view", "stock.view", "stock.adjust"],
  ACCOUNTANT: [
    "product.view",
    "price.view",
    "cost.view",
    "invoice.issue",
    "payment.record",
    "expense.record",
    "report.view",
  ],
} as const satisfies Record<AdminRole, readonly AdminPermission[]>;

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return roleGrants[role].some((granted) => granted === permission);
}

export function canGrant(actorRole: AdminRole, permission: AdminPermission): boolean {
  return hasPermission(actorRole, "user.manage") && hasPermission(actorRole, permission);
}
