import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { SupplierActions } from "@/components/admin/SupplierActions";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { listSuppliers, supplierAccess } from "@/services/admin-suppliers";

export const metadata = { title: "Suppliers" };

export default function SuppliersPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading suppliers</p>}>
      <Suppliers />
    </Suspense>
  );
}

async function Suppliers() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = supplierAccess(staff.profile.role);

  if (!access.view) {
    return (
      <AdminBar profile={staff.profile} title="Suppliers">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const suppliers = await listSuppliers(getPrisma());

  return (
    <AdminBar profile={staff.profile} title="Suppliers">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {suppliers.length === 0
            ? "No suppliers yet."
            : suppliers.length === 1
              ? "1 supplier"
              : `${suppliers.length} suppliers`}
        </p>
        {access.update ? (
          <a href="/admin/suppliers/new" className="btn btn-primary">
            New supplier
          </a>
        ) : null}
      </div>
      {suppliers.length === 0 ? null : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Supplier</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Contact</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Phone</th>
                <th className="px-4 py-3 text-sm font-bold text-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{supplier.name}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{supplier.contactName || "—"}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{supplier.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusText tone={supplier.isActive ? "good" : "bad"}>{supplier.isActive ? "Active" : "Inactive"}</StatusText>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {access.update ? <SupplierActions id={supplier.id} /> : null}
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
