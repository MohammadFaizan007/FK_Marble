import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { CustomerActions } from "@/components/admin/CustomerActions";
import { loadStaffPage } from "@/lib/admin-page";
import { customerTypeLabels } from "@/lib/customer-schema";
import { getPrisma } from "@/lib/prisma";
import { customerAccess, listCustomers } from "@/services/admin-customers";

export const metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading customers</p>}>
      <Customers />
    </Suspense>
  );
}

async function Customers() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = customerAccess(staff.profile.role);

  if (!access.view) {
    return (
      <AdminBar profile={staff.profile} title="Customers">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const customers = await listCustomers(getPrisma());
  const count = customers.length === 0 ? "No customers yet." : customers.length === 1 ? "1 customer" : `${customers.length} customers`;

  return (
    <AdminBar profile={staff.profile} title="Customers">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{count}</p>
        {access.update ? (
          <a href="/admin/customers/new" className="btn btn-primary">
            New customer
          </a>
        ) : null}
      </div>
      {customers.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Customer</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Type</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Phone</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{customer.name}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{customerTypeLabels[customer.type]}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusText tone={customer.isActive ? "good" : "bad"}>{customer.isActive ? "Active" : "Inactive"}</StatusText>
                  </td>
                  <td className="px-4 py-3 text-right">{access.update ? <CustomerActions id={customer.id} /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminBar>
  );
}
