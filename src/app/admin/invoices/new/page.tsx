import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess } from "@/services/admin-documents";

export const metadata = { title: "New invoice" };

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading invoice</p>}>
      <NewInvoice />
    </Suspense>
  );
}

async function NewInvoice() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!documentAccess(staff.profile.role).draftInvoice) {
    return (
      <AdminBar profile={staff.profile} title="New invoice">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
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
    <AdminBar profile={staff.profile} title="New invoice">
      {customers.length === 0 || products.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Add an active customer and an active product that is not a demo sample before creating an invoice.
        </p>
      ) : (
        <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-5">
          <DocumentForm
            kind="invoice"
            action="/api/admin/invoices"
            method="POST"
            nextHref="/admin/invoices"
            customers={customers}
            products={products}
          />
        </div>
      )}
    </AdminBar>
  );
}
