import { Suspense } from "react";
import { AdminBar } from "@/components/admin/AdminBar";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { loadStaffPage } from "@/lib/admin-page";
import { catalogueAccess } from "@/services/admin-catalogue";

export const metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading category</p>}>
      <NewCategory />
    </Suspense>
  );
}

async function NewCategory() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  if (!catalogueAccess(staff.profile.role).create) {
    return (
      <AdminBar profile={staff.profile} title="New category">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  return (
    <AdminBar profile={staff.profile} title="New category">
      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-surface p-6">
        <CategoryForm
          action="/api/admin/categories"
          nextHref="/admin/categories"
          initial={{
            name: "",
            nameHi: "",
            slug: "",
            description: "",
            descriptionHi: "",
            image: "",
            displayOrder: 7,
            isActive: true,
          }}
        />
      </div>
    </AdminBar>
  );
}
