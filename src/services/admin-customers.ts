import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AdminRole } from "@/generated/prisma/client";
import type { CustomerInput } from "@/lib/customer-schema";
import { hasPermission } from "@/lib/permissions";

type Writer = PrismaClient | Prisma.TransactionClient;

export class CustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found.");
    this.name = "CustomerNotFoundError";
  }
}

export class CustomerInUseError extends Error {
  constructor() {
    super("This customer has sales orders, so the record stays on file.");
    this.name = "CustomerInUseError";
  }
}

export function customerAccess(role: AdminRole) {
  return {
    view: hasPermission(role, "sales.create") || hasPermission(role, "sales.approve"),
    update: hasPermission(role, "sales.create"),
  };
}

export function listCustomers(db: PrismaClient) {
  return db.customer.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
}

export function createCustomer(db: Writer, input: CustomerInput) {
  return db.customer.create({
    data: { id: randomUUID(), ...input },
  });
}

export async function updateCustomer(db: Writer, id: string, input: CustomerInput) {
  const existing = await db.customer.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return null;
  }

  return db.customer.update({ where: { id }, data: input });
}

export async function deleteCustomer(db: Writer, id: string) {
  const existing = await db.customer.findUnique({
    where: { id },
    select: { id: true, _count: { select: { salesOrders: true } } },
  });

  if (!existing) {
    return null;
  }

  if (existing._count.salesOrders > 0) {
    throw new CustomerInUseError();
  }

  await db.customer.delete({ where: { id } });
  return existing.id;
}
