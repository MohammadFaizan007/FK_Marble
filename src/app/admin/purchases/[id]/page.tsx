import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { PurchaseActions } from "@/components/admin/PurchaseActions";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { getPurchaseOrder, purchaseAccess } from "@/services/admin-purchases";

export const metadata = { title: "Purchase order" };

const statusLabels = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  PARTIALLY_RECEIVED: "Partly received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
} as const;

export default function PurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading purchase order</p>}>
      <PurchaseDetail params={params} />
    </Suspense>
  );
}

async function PurchaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = purchaseAccess(staff.profile.role);
  const { id } = await params;
  const order = await getPurchaseOrder(getPrisma(), id);

  if (!order || !access.view) {
    return (
      <AdminBar profile={staff.profile} title="Purchase order">
        <p className="mt-6 text-sm text-muted-foreground">
          {order ? "You do not have permission for this action." : "Purchase order not found."}
        </p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title={order.number}>
      <p className="mt-2 text-sm text-muted-foreground">
        {order.supplier.name} ·{" "}
        <StatusText
          tone={order.status === "CANCELLED" ? "bad" : order.status === "DRAFT" || order.status === "PARTIALLY_RECEIVED" ? "wait" : "good"}
        >
          {statusLabels[order.status]}
        </StatusText>
      </p>
      {order.notes ? <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">{order.notes}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Product</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Ordered</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Received</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Still due</th>
              {access.stock ? (
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">On hand</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{item.productName}</td>
                <td className="px-4 py-3 text-sm text-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-foreground">{item.receivedQuantity}</td>
                <td className="px-4 py-3 text-sm text-foreground">{item.remaining}</td>
                {access.stock ? <td className="px-4 py-3 text-sm text-foreground">{item.onHand}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PurchaseActions
        orderId={order.id}
        status={order.status}
        canCreate={access.create}
        canApprove={access.approve}
        lines={order.items.map((item) => ({ id: item.id, productName: item.productName, remaining: item.remaining }))}
      />
    </AdminBar>
  );
}
