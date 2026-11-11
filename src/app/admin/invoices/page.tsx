import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, listInvoices, listTotal, type InvoiceStatus } from "@/services/admin-documents";

export const metadata = { title: "Invoices" };

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  CANCELLED: "Cancelled",
};

function statusTone(status: InvoiceStatus) {
  if (status === "CANCELLED") {
    return "bad" as const;
  }

  if (status === "ISSUED") {
    return "good" as const;
  }

  return "wait" as const;
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading invoices</p>}>
      <Invoices />
    </Suspense>
  );
}

async function Invoices() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = documentAccess(staff.profile.role);

  if (!access.viewInvoices) {
    return (
      <AdminBar profile={staff.profile} title="Invoices">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const invoices = await listInvoices(getPrisma());
  const count = invoices.length === 0 ? "No invoices yet." : invoices.length === 1 ? "1 invoice" : `${invoices.length} invoices`;

  return (
    <AdminBar profile={staff.profile} title="Invoices">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{count}</p>
        {access.draftInvoice ? (
          <a href="/admin/invoices/new" className="btn btn-primary">
            New invoice
          </a>
        ) : null}
      </div>
      {invoices.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Invoice</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Customer</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Status</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Total</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{invoice.number ?? "Draft"}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{invoice.customer.name}</td>
                  <td className="px-4 py-3">
                    <StatusText tone={statusTone(invoice.status)}>{statusLabels[invoice.status]}</StatusText>
                  </td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{listTotal(invoice.items)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/invoices/${invoice.id}`} className="text-sm font-bold text-[#1F6B3A] underline">
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
