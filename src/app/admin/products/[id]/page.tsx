import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { ImageEditor } from "@/components/admin/ImageEditor";
import { ProductForm } from "@/components/admin/ProductForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { catalogueAccess, getAdminProduct, listAdminCategories, toAdminProduct } from "@/services/admin-catalogue";

export const metadata = { title: "Edit product" };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading product</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = catalogueAccess(staff.profile.role);
  const { id } = await params;
  const product = await getAdminProduct(getPrisma(), id);

  if (!product || !access.update) {
    return (
      <AdminBar profile={staff.profile} title="Edit product">
        <p className="mt-6 text-sm text-muted-foreground">
          {product ? "You do not have permission for this action." : "Product not found."}
        </p>
      </AdminBar>
    );
  }

  const categories = await listAdminCategories(getPrisma());
  const view = toAdminProduct(product, access);

  return (
    <AdminBar profile={staff.profile} title={view.name}>
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        {view.isDemo ? (
          <p className="mb-4 text-sm text-muted-foreground">This is a demo sample. It is not public stock.</p>
        ) : null}
        <ProductForm
          action={`/api/admin/products/${view.id}`}
          nextHref="/admin/products"
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          showPrices={access.prices && access.changePrices}
          showCost={access.cost && access.changePrices}
          product={view}
        />
        <ImageEditor productId={view.id} images={view.images} />
      </div>
    </AdminBar>
  );
}
