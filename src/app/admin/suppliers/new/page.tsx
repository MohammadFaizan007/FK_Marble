import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { SupplierForm } from "@/components/admin/SupplierForm";
import { loadStaffPage } from "@/lib/admin-page";
import { supplierAccess } from "@/services/admin-suppliers";

export const metadata = { title: "New supplier" };

export default function NewSupplierPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading supplier</p>}>
      <NewSupplier />
    </Suspense>
  );
}

async function NewSupplier() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!supplierAccess(staff.profile.role).update) {
    return (
      <AdminBar profile={staff.profile} title="New supplier">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title="New supplier">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <SupplierForm
          action="/api/admin/suppliers"
          nextHref="/admin/suppliers"
          initial={{
            name: "",
            contactName: "",
            phone: "",
            email: "",
            address: "",
            gstin: "",
            notes: "",
            isActive: true,
          }}
        />
      </div>
    </AdminBar>
  );
}
