import { Suspense } from "react";
import { AdminBar, StatusPill } from "@/components/admin/AdminBar";
import { loadStaffPage } from "@/lib/admin-page";
import { getPrisma } from "@/lib/prisma";
import { catalogueAccess, listAdminCategories } from "@/services/admin-catalogue";

export const metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading categories</p>}>
      <Categories />
    </Suspense>
  );
}

async function Categories() {
  const staff = await loadStaffPage();

  if (!staff.ok) {
    return <p className="px-4 py-16 text-sm text-muted-foreground">{staff.message}</p>;
  }

  const access = catalogueAccess(staff.profile.role);

  if (!access.view) {
    return (
      <AdminBar profile={staff.profile} title="Categories">
        <p className="mt-6 text-sm text-muted-foreground">You do not have permission for this action.</p>
      </AdminBar>
    );
  }

  const categories = await listAdminCategories(getPrisma());

  return (
    <AdminBar profile={staff.profile} title="Categories">
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        {access.create ? (
          <a href="/admin/categories/new" className="btn btn-primary">
            New category
          </a>
        ) : null}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Category</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Slug</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Products</th>
              <th className="px-4 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                    ) : null}
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3 text-sm text-foreground">{category._count.products}</td>
                <td className="px-4 py-3">
                  <StatusPill on={category.isActive} onLabel="Active" offLabel="Hidden" />
                </td>
                <td className="px-4 py-3 text-right">
                  {access.update ? (
                    <a href={`/admin/categories/${category.id}`} className="text-sm font-medium text-foreground underline decoration-border underline-offset-4">
                      Edit
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminBar>
  );
}
