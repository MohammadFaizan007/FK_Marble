import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { SalesOrderForm } from "@/components/admin/SalesOrderForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { salesAccess } from "@/services/admin-sales";

export const metadata = { title: "New sales order" };

export default function NewSalesPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading sales order</p>}>
      <NewSales />
    </Suspense>
  );
}

async function NewSales() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!salesAccess(staff.profile.role).create) {
    return (
      <AdminBar profile={staff.profile} title="New sales order">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const prisma = getPrisma();
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: { isActive: true, isDemo: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AdminBar profile={staff.profile} title="New sales order">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        {customers.length === 0 || products.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Add an active customer and an active product that is not a demo sample before creating a sales order.
          </p>
        ) : (
          <SalesOrderForm customers={customers} products={products} />
        )}
      </div>
    </AdminBar>
  );
}
