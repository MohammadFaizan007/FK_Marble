import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { customerAccess } from "@/services/admin-customers";

export const metadata = { title: "Edit customer" };

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading customer</p>}>
      <EditCustomer params={params} />
    </Suspense>
  );
}

async function EditCustomer({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const { id } = await params;
  const customer = await getPrisma().customer.findUnique({ where: { id } });

  if (!customer || !customerAccess(staff.profile.role).update) {
    return (
      <AdminBar profile={staff.profile} title="Edit customer">
        <p className="mt-6 text-sm text-muted-foreground">
          {customer ? "You do not have permission for this action." : "Customer not found."}
        </p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title={customer.name}>
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <CustomerForm action={`/api/admin/customers/${customer.id}`} nextHref="/admin/customers" initial={customer} />
      </div>
    </AdminBar>
  );
}
