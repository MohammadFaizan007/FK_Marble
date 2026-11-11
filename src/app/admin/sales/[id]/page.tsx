import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { SalesActions } from "@/components/admin/SalesActions";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { getSalesOrder, salesAccess } from "@/services/admin-sales";

export const metadata = { title: "Sales order" };

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

export default function SalesOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading sales order</p>}>
      <SalesDetail params={params} />
    </Suspense>
  );
}

async function SalesDetail({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = salesAccess(staff.profile.role);
  const { id } = await params;
  const order = await getSalesOrder(getPrisma(), id);

  if (!order || !access.view) {
    return (
      <AdminBar profile={staff.profile} title="Sales order">
        <p className="mt-6 text-sm text-muted-foreground">{order ? "You do not have permission for this action." : "Sales order not found."}</p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title={order.number}>
      <p className="mt-2 text-sm text-muted-foreground">
        {order.customer.name} · <StatusText tone={statusTone(order.status)}>{statusLabels[order.status]}</StatusText>
      </p>
      {order.notes ? <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">{order.notes}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Product</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Ordered</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Reserved</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Dispatched</th>
              {access.stock ? <th className="px-4 py-3 text-sm font-bold text-foreground">Available</th> : null}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.productName}</td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.reservedQuantity}</td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.dispatchedQuantity}</td>
                {access.stock ? <td className="px-4 py-3 text-sm font-normal text-foreground">{item.available}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SalesActions
        orderId={order.id}
        status={order.status}
        canCreate={access.create}
        canApprove={access.approve}
        lines={order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          toReserve: item.toReserve,
          toDispatch: item.toDispatch,
          available: item.available,
        }))}
      />
    </AdminBar>
  );
}
