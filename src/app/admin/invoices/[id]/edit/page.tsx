import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { documentUnits } from "@/lib/document-schema";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, getInvoice } from "@/services/admin-documents";

export const metadata = { title: "Edit invoice" };

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading invoice</p>}>
      <EditInvoice params={params} />
    </Suspense>
  );
}

async function EditInvoice({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!documentAccess(staff.profile.role).draftInvoice) {
    return (
      <AdminBar profile={staff.profile} title="Edit invoice">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const invoice = await getInvoice(getPrisma(), (await params).id);

  if (!invoice || invoice.status !== "DRAFT" || invoice.quotation) {
    return (
      <AdminBar profile={staff.profile} title="Edit invoice">
        <p className="mt-6 text-sm text-muted-foreground">An issued invoice stays as it was issued.</p>
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
    <AdminBar profile={staff.profile} title="Draft invoice">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-5">
        <DocumentForm
          kind="invoice"
          action={`/api/admin/invoices/${invoice.id}`}
          method="PATCH"
          nextHref={`/admin/invoices/${invoice.id}`}
          customers={customers}
          products={products}
          initial={{
            customerId: invoice.customer.id,
            notes: invoice.notes,
            items: invoice.items.map((item) => ({
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
