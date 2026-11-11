import { Suspense } from "react";
import { AdminBar, StatusPill } from "@/components/admin/AdminBar";
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
          {suppliers.length === 0 ? "No suppliers yet." : `${suppliers.length} suppliers`}
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
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Supplier</th>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Contact</th>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Phone</th>
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">{supplier.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{supplier.contactName || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{supplier.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill on={supplier.isActive} onLabel="Active" offLabel="Inactive" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {access.update ? (
                      <a href={`/admin/suppliers/${supplier.id}`} className="text-sm font-medium text-foreground underline decoration-border underline-offset-4">
                        Edit
                      </a>
                    ) : null}
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
