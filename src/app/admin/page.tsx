import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { AdminBar } from "@/components/admin/AdminBar";
import { readAdminSession, type AdminProfile } from "@/lib/admin-auth";
import { adminSessionCookieName } from "@/lib/admin-session";
import { databaseUnavailableMessage } from "@/lib/database";
import { getAdminDashboardCounts, type AdminDashboardCounts } from "@/services/admin-dashboard";

export const metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Loading dashboard</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await connection();
  const token = (await cookies()).get(adminSessionCookieName)?.value ?? null;
  let profile: AdminProfile | null = null;

  try {
    profile = await readAdminSession(token);
  } catch (error) {
    unstable_rethrow(error);
    return <p className="px-4 py-16 text-sm text-muted-foreground">{databaseUnavailableMessage}</p>;
  }

  if (!profile) {
    redirect("/admin/login");
  }

  let counts: AdminDashboardCounts;

  try {
    counts = await getAdminDashboardCounts();
  } catch (error) {
    unstable_rethrow(error);
    return <p className="px-4 py-16 text-sm text-muted-foreground">{databaseUnavailableMessage}</p>;
  }

  const number = new Intl.NumberFormat("en-IN");
  const cards = [
    ["Active categories", counts.activeCategories],
    ["Public products", counts.publicProducts],
    ["Demo samples", counts.demoProducts],
    ["Enquiries on file", counts.enquiries],
    ["Pending enquiries", counts.pendingEnquiries],
    ["Active staff", counts.activeStaff],
    ["Suppliers on file", counts.suppliers],
    ["Purchase orders", counts.purchaseOrders],
    ["Customers on file", counts.customers],
    ["Sales orders", counts.salesOrders],
    ["Quotations", counts.quotations],
    ["Invoices", counts.invoices],
  ] as const;

  const peak = Math.max(...cards.map(([, value]) => value), 1);

  return (
    <AdminBar profile={profile} title={`Welcome back, ${profile.name}`}>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          These counts come from the database. Demo samples stay out of the public product count. Stock value and
          profit stay off this page.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <li key={label} className="rounded-xl border border-border bg-surface px-5 py-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 font-heading text-4xl text-foreground">{number.format(value)}</p>
          </li>
        ))}
      </ul>
      <section className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-2xl text-foreground">Records on file</h2>
        <ul className="mt-5 grid gap-4">
          {cards.map(([label, value]) => (
            <li key={label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-foreground">{label}</span>
                <span className="font-medium text-foreground">{number.format(value)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${Math.max(4, Math.round((value / peak) * 100))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AdminBar>
  );
}
