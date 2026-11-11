import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { ProductForm } from "@/components/admin/ProductForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { catalogueAccess, listAdminCategories } from "@/services/admin-catalogue";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading product</p>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = catalogueAccess(staff.profile.role);

  if (!access.create) {
    return (
      <AdminBar profile={staff.profile} title="New product">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const categories = await listAdminCategories(getPrisma());

  return (
    <AdminBar profile={staff.profile} title="New product">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <ProductForm
          action="/api/admin/products"
          nextHref="/admin/products"
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          showPrices={access.prices && access.changePrices}
          showCost={access.cost && access.changePrices}
          product={{
            categoryId: categories[0]?.id ?? "",
            availability: "Confirm on enquiry",
            isActive: true,
            isDemo: false,
            showPrice: false,
          }}
        />
      </div>
    </AdminBar>
  );
}
