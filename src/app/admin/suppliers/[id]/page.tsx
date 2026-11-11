import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { SupplierForm } from "@/components/admin/SupplierForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { supplierAccess } from "@/services/admin-suppliers";

export const metadata = { title: "Edit supplier" };

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading supplier</p>}>
      <EditSupplier params={params} />
    </Suspense>
  );
}

async function EditSupplier({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const { id } = await params;
  const supplier = await getPrisma().supplier.findUnique({ where: { id } });

  if (!supplier || !supplierAccess(staff.profile.role).update) {
    return (
      <AdminBar profile={staff.profile} title="Edit supplier">
        <p className="mt-6 text-sm text-muted-foreground">
          {supplier ? "You do not have permission for this action." : "Supplier not found."}
        </p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title={supplier.name}>
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <SupplierForm action={`/api/admin/suppliers/${supplier.id}`} nextHref="/admin/suppliers" initial={supplier} />
      </div>
    </AdminBar>
  );
}
