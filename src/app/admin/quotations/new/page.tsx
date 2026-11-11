import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { documentAccess } from "@/services/admin-documents";

export const metadata = { title: "New quotation" };

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading quotation</p>}>
      <NewQuotation />
    </Suspense>
  );
}

async function NewQuotation() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!documentAccess(staff.profile.role).editQuotes) {
    return (
      <AdminBar profile={staff.profile} title="New quotation">
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
    <AdminBar profile={staff.profile} title="New quotation">
      {customers.length === 0 || products.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Add an active customer and an active product that is not a demo sample before creating a quotation.
        </p>
      ) : (
        <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-5">
          <DocumentForm
            kind="quotation"
            action="/api/admin/quotations"
            method="POST"
            nextHref="/admin/quotations"
            customers={customers}
            products={products}
          />
        </div>
      )}
    </AdminBar>
  );
}
