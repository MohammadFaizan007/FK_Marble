import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { documentUnitLabels, documentUnits } from "@/lib/document-schema";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, getQuotation, type QuotationStatus } from "@/services/admin-documents";

export const metadata = { title: "Quotation" };

const statusLabels: Record<QuotationStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CONVERTED: "Converted",
};

function statusTone(status: QuotationStatus) {
  if (status === "REJECTED" || status === "EXPIRED") {
    return "bad" as const;
  }

  if (status === "ACCEPTED" || status === "CONVERTED") {
    return "good" as const;
  }

  return "wait" as const;
}

export default function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading quotation</p>}>
      <QuotationDetail params={params} />
    </Suspense>
  );
}

async function QuotationDetail({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = documentAccess(staff.profile.role);

  if (!access.viewQuotes) {
    return (
      <AdminBar profile={staff.profile} title="Quotation">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const quote = await getQuotation(getPrisma(), (await params).id);

  if (!quote) {
    return (
      <AdminBar profile={staff.profile} title="Quotation">
        <p className="mt-6 text-sm text-muted-foreground">Quotation not found.</p>
      </AdminBar>
    );
  }

  const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
  const openInvoice = quote.invoices.some((invoice) => invoice.status === "DRAFT" || invoice.status === "ISSUED");

  return (
    <AdminBar profile={staff.profile} title={`${quote.number} revision ${quote.revision}`}>
      <p className="mt-2 text-sm text-muted-foreground">
        {quote.customer.name} · <StatusText tone={statusTone(quote.status)}>{statusLabels[quote.status]}</StatusText>
        {quote.validUntil ? ` · Valid until ${when.format(quote.validUntil)}` : ""}
      </p>
      {quote.notes ? <p className="mt-4 max-w-3xl text-sm leading-6 text-foreground">{quote.notes}</p> : null}
      {quote.terms ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{quote.terms}</p> : null}
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
            {quote.items.map((item) => (
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
      <p className="mt-4 text-sm font-bold text-foreground">Total {quote.total}</p>
      <DocumentActions
        kind="quotation"
        id={quote.id}
        status={quote.status}
        customerId={quote.customer.id}
        salesOrderId={quote.salesOrderId}
        canEdit={access.editQuotes}
        canIssue={false}
        hasOpenInvoice={openInvoice}
      />
    </AdminBar>
  );
}
