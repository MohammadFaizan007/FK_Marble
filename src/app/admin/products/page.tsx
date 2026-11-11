import { Suspense } from "react";
import { AdminBar, StatusPill } from "@/components/admin/AdminBar";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { catalogueAccess, listAdminProducts, toAdminProduct } from "@/services/admin-catalogue";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading products</p>}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = catalogueAccess(staff.profile.role);

  if (!access.view) {
    return (
      <AdminBar profile={staff.profile} title="Products">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const products = await listAdminProducts(getPrisma());

  return (
    <AdminBar profile={staff.profile} title="Products">
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Demo samples stay off the public website. Prices shown here are for staff. The public site receives a retail
          price only when that product is set to show it.
        </p>
        {access.create ? (
          <a href="/admin/products/new" className="btn btn-primary shrink-0">
            New product
          </a>
        ) : null}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Product</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Category</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Status</th>
              {access.prices ? (
                <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Retail price</th>
              ) : null}
              <th className="px-4 py-3 text-right text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const view = toAdminProduct(product, access);
              return (
                <tr key={product.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">{view.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{view.categoryName}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      on={view.isActive && !view.isDemo}
                      onLabel="Public"
                      offLabel={view.isDemo ? "Demo sample" : "Hidden"}
                    />
                  </td>
                  {access.prices ? (
                    <td className="px-4 py-3 text-sm text-foreground">
                      {view.showPrice && view.price ? `₹${view.price}` : "Price on enquiry"}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-right">
                    {access.update ? (
                      <a href={`/admin/products/${product.id}`} className="text-sm font-medium text-foreground underline decoration-border underline-offset-4">
                        Edit
                      </a>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminBar>
  );
}
