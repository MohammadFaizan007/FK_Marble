import { Suspense } from "react";
import { AdminBar, StatusText } from "@/components/admin/AdminBar";
import { ProductActions } from "@/components/admin/ProductActions";
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
              <th className="px-4 py-3 text-sm font-bold text-foreground">Product</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Category</th>
              <th className="px-4 py-3 text-sm font-bold text-foreground">Status</th>
              {access.prices ? (
                <th className="px-4 py-3 text-sm font-bold text-foreground">Retail price</th>
              ) : null}
              <th className="px-4 py-3 text-right text-sm font-bold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const view = toAdminProduct(product, access);
              return (
                <tr key={product.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{view.name}</td>
                  <td className="px-4 py-3 text-sm font-normal text-foreground">{view.categoryName}</td>
                  <td className="px-4 py-3">
                    <StatusText tone={view.isDemo ? "wait" : view.isActive ? "good" : "bad"}>
                      {view.isActive && !view.isDemo ? "Public" : view.isDemo ? "Demo sample" : "Hidden"}
                    </StatusText>
                  </td>
                  {access.prices ? (
                    <td className="px-4 py-3 text-sm font-normal text-foreground">
                      {view.showPrice && view.price ? `₹${view.price}` : "Price on enquiry"}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-right">
                    {access.update ? <ProductActions id={product.id} /> : null}
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
