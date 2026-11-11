import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { documentUnitLabels, documentUnits } from "@/lib/document-schema";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, getInvoice, type InvoiceStatus } from "@/services/admin-documents";

export const metadata = { title: "Invoice" };

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

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading invoice</p>}>
      <InvoiceDetail params={params} />
    </Suspense>
  );
}

async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = documentAccess(staff.profile.role);

  if (!access.viewInvoices) {
    return (
      <AdminBar profile={staff.profile} title="Invoice">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const invoice = await getInvoice(getPrisma(), (await params).id);

  if (!invoice) {
    return (
      <AdminBar profile={staff.profile} title="Invoice">
        <p className="mt-6 text-sm text-muted-foreground">Invoice not found.</p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title={invoice.number ?? "Draft invoice"}>
      <p className="mt-2 text-sm text-muted-foreground">
        {invoice.customer.name} · <StatusText tone={statusTone(invoice.status)}>{statusLabels[invoice.status]}</StatusText>
      </p>
      {invoice.quotation ? (
        <p className="mt-3 text-sm">
          <a href={`/admin/quotations/${invoice.quotation.id}`} className="font-bold text-[#1F6B3A] underline">
            {invoice.quotation.number} revision {invoice.quotation.revision}
          </a>
        </p>
      ) : null}
      {invoice.notes ? <p className="mt-4 max-w-3xl text-sm leading-6 text-foreground">{invoice.notes}</p> : null}
      {invoice.cancelReason ? <p className="mt-3 text-sm font-bold text-destructive">{invoice.cancelReason}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Product</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Quantity</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Unit</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Rate</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.productName}</td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">
                  {documentUnitLabels[item.unit as (typeof documentUnits)[number]] ?? item.unit}
                </td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.rate}</td>
                <td className="px-4 py-3 text-sm font-normal text-foreground">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm font-bold text-foreground">Total {invoice.total}</p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        An issued invoice keeps its number. Cancelling it leaves the record on file. Tax and payments stay off this page.
      </p>
      <DocumentActions
        kind="invoice"
        id={invoice.id}
        status={invoice.status}
        salesOrderId={invoice.salesOrderId}
        canEdit={access.draftInvoice}
        canChangeLines={!invoice.quotation}
        canIssue={access.issueInvoice}
      />
    </AdminBar>
  );
}
