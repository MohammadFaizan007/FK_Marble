import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { catalogueAccess } from "@/services/admin-catalogue";

export const metadata = { title: "Edit category" };

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading category</p>}>
      <EditCategory params={params} />
    </Suspense>
  );
}

async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const { id } = await params;
  const category = await getPrisma().category.findUnique({ where: { id } });

  if (!category || !catalogueAccess(staff.profile.role).update) {
    return (
      <AdminBar profile={staff.profile} title="Edit category">
        <p className="mt-6 text-sm text-muted-foreground">
          {category ? "You do not have permission for this action." : "Category not found."}
        </p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title={category.name}>
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <CategoryForm
          action={`/api/admin/categories/${category.id}`}
          nextHref="/admin/categories"
          initial={category}
        />
      </div>
    </AdminBar>
  );
}
