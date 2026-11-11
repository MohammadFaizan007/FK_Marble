import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { documentUnits } from "@/lib/document-schema";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, getQuotation } from "@/services/admin-documents";

export const metadata = { title: "Edit quotation" };

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading quotation</p>}>
      <EditQuotation params={params} />
    </Suspense>
  );
}

async function EditQuotation({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!documentAccess(staff.profile.role).editQuotes) {
    return (
      <AdminBar profile={staff.profile} title="Edit quotation">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const quote = await getQuotation(getPrisma(), (await params).id);

  if (!quote || quote.status !== "DRAFT") {
    return (
      <AdminBar profile={staff.profile} title="Edit quotation">
        <p className="mt-6 text-sm text-muted-foreground">A quotation that has left draft stays as it was sent.</p>
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
    <AdminBar profile={staff.profile} title={`${quote.number} revision ${quote.revision}`}>
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-5">
        <DocumentForm
          kind="quotation"
          action={`/api/admin/quotations/${quote.id}`}
          method="PATCH"
          nextHref={`/admin/quotations/${quote.id}`}
          customers={customers}
          products={products}
          initial={{
            customerId: quote.customer.id,
            validUntil: quote.validUntil ? quote.validUntil.toISOString().slice(0, 10) : "",
            notes: quote.notes,
            terms: quote.terms,
            items: quote.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unit: item.unit as (typeof documentUnits)[number],
              rate: item.rate,
            })),
          }}
        />
      </div>
    </AdminBar>
  );
}
