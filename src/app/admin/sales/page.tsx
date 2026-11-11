import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { listSalesOrders, salesAccess } from "@/services/admin-sales";

export const metadata = { title: "Sales" };

const statusLabels = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  PARTIALLY_RESERVED: "Partly reserved",
  RESERVED: "Reserved",
  PARTIALLY_DISPATCHED: "Partly dispatched",
  DISPATCHED: "Dispatched",
  CANCELLED: "Cancelled",
} as const;

function statusTone(status: keyof typeof statusLabels) {
  if (status === "CANCELLED") {
    return "bad" as const;
  }

  if (status === "APPROVED" || status === "DISPATCHED") {
    return "good" as const;
  }

  return "wait" as const;
}

export default function SalesPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading sales</p>}>
      <Sales />
    </Suspense>
  );
}

async function Sales() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = salesAccess(staff.profile.role);

  if (!access.view) {
    return (
      <AdminBar profile={staff.profile} title="Sales">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const orders = await listSalesOrders(getPrisma());
  const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
  const count = orders.length === 0 ? "No sales orders yet." : orders.length === 1 ? "1 sales order" : `${orders.length} sales orders`;

  return (
    <AdminBar profile={staff.profile} title="Sales">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{count}</p>
        {access.create ? (
          <a href="/admin/sales/new" className="btn btn-primary">
            New sales order
          </a>
        ) : null}
      </div>
      {orders.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Order</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Customer</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Status</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Created</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{order.number}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{order.customer.name}</td>
                  <td className="px-4 py-3">
                    <StatusText tone={statusTone(order.status)}>{statusLabels[order.status]}</StatusText>
                  </td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{when.format(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/sales/${order.id}`} className="text-sm font-bold text-[#1F6B3A] underline decoration-[#1F6B3A]/40 underline-offset-4">
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
