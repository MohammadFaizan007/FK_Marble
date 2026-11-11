import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { listPurchaseOrders, purchaseAccess } from "@/services/admin-purchases";

export const metadata = { title: "Purchases" };

const statusLabels = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  PARTIALLY_RECEIVED: "Partly received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
} as const;

export default function PurchasesPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading purchases</p>}>
      <Purchases />
    </Suspense>
  );
}

async function Purchases() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = purchaseAccess(staff.profile.role);

  if (!access.view) {
    return (
      <AdminBar profile={staff.profile} title="Purchases">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const orders = await listPurchaseOrders(getPrisma());
  const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

  return (
    <AdminBar profile={staff.profile} title="Purchases">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {orders.length === 0 ? "No purchase orders yet." : orders.length === 1 ? "1 purchase order" : `${orders.length} purchase orders`}
        </p>
        {access.create ? (
          <a href="/admin/purchases/new" className="btn btn-primary">
            New purchase order
          </a>
        ) : null}
      </div>
      {orders.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Order</th>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Supplier</th>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">{order.number}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.supplier.name}</td>
                  <td className="px-4 py-3">
                    <StatusText
                      tone={order.status === "CANCELLED" ? "bad" : order.status === "DRAFT" || order.status === "PARTIALLY_RECEIVED" ? "wait" : "good"}
                    >
                      {statusLabels[order.status]}
                    </StatusText>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{when.format(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/purchases/${order.id}`} className="text-sm font-medium text-foreground underline decoration-border underline-offset-4">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminBar>
  );
}
