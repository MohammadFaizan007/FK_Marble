import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { loadStaffPage } from "@/lib/admin-page";
import { customerAccess } from "@/services/admin-customers";

export const metadata = { title: "New customer" };

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading customer</p>}>
      <NewCustomer />
    </Suspense>
  );
}

async function NewCustomer() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!customerAccess(staff.profile.role).update) {
    return (
      <AdminBar profile={staff.profile} title="New customer">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title="New customer">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <CustomerForm
          action="/api/admin/customers"
          nextHref="/admin/customers"
          initial={{
            name: "",
            type: "RETAIL",
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
