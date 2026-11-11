import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, listQuotations, listTotal, type QuotationStatus } from "@/services/admin-documents";

export const metadata = { title: "Quotations" };

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

export default function QuotationsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading quotations</p>}>
      <Quotations />
    </Suspense>
  );
}

async function Quotations() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = documentAccess(staff.profile.role);

  if (!access.viewQuotes) {
    return (
      <AdminBar profile={staff.profile} title="Quotations">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const quotes = await listQuotations(getPrisma());
  const count = quotes.length === 0 ? "No quotations yet." : quotes.length === 1 ? "1 quotation" : `${quotes.length} quotations`;

  return (
    <AdminBar profile={staff.profile} title="Quotations">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{count}</p>
        {access.editQuotes ? (
          <a href="/admin/quotations/new" className="btn btn-primary">
            New quotation
          </a>
        ) : null}
      </div>
      {quotes.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Quotation</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Customer</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Status</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Total</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-normal text-foreground">
                    {quote.number} revision {quote.revision}
                  </td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{quote.customer.name}</td>
                  <td className="px-4 py-3">
                    <StatusText tone={statusTone(quote.status)}>{statusLabels[quote.status]}</StatusText>
                  </td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{listTotal(quote.items)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/quotations/${quote.id}`} className="text-sm font-bold text-[#1F6B3A] underline">
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
