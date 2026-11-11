import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AdminRole } from "@/generated/prisma/client";
import type { SupplierInput } from "@/lib/supplier-schema";
import { hasPermission } from "@/lib/permissions";

type SupplierWriter = PrismaClient | Prisma.TransactionClient;

export class SupplierNotFoundError extends Error {
  constructor() {
    super("Supplier not found.");
    this.name = "SupplierNotFoundError";
  }
}

export function supplierAccess(role: AdminRole) {
  return {
    view: hasPermission(role, "supplier.view"),
    update: hasPermission(role, "supplier.update"),
  };
}

export function listSuppliers(db: PrismaClient) {
  return db.supplier.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
}

export function createSupplier(db: SupplierWriter, input: SupplierInput) {
  return db.supplier.create({
    data: { id: randomUUID(), ...input },
  });
}

export async function updateSupplier(db: SupplierWriter, id: string, input: SupplierInput) {
  const existing = await db.supplier.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return null;
  }

  return db.supplier.update({ where: { id }, data: input });
}
