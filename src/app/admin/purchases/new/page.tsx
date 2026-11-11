import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { PurchaseOrderForm } from "@/components/admin/PurchaseOrderForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { purchaseAccess } from "@/services/admin-purchases";

export const metadata = { title: "New purchase order" };

export default function NewPurchasePage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading purchase order</p>}>
      <NewPurchase />
    </Suspense>
  );
}

async function NewPurchase() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!purchaseAccess(staff.profile.role).create) {
    return (
      <AdminBar profile={staff.profile} title="New purchase order">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const prisma = getPrisma();
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: { isActive: true, isDemo: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AdminBar profile={staff.profile} title="New purchase order">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        {suppliers.length === 0 || products.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Add an active supplier and an active product that is not a demo sample before creating a purchase order.
          </p>
        ) : (
          <PurchaseOrderForm suppliers={suppliers} products={products} />
        )}
      </div>
    </AdminBar>
  );
}
