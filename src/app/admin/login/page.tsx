import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/LoginForm";
import { readAdminSession } from "@/lib/admin-auth";
import { adminSessionCookieName } from "@/lib/admin-session";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Staff sign in",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-muted-foreground">Loading sign in</p>}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  await connection();
  const token = (await cookies()).get(adminSessionCookieName)?.value ?? null;

  if (token) {
    try {
      const profile = await readAdminSession(token);
      if (profile) {
        redirect("/admin");
      }
    } catch (error) {
      unstable_rethrow(error);
    }
  }

  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-primary px-8 py-8 text-primary-foreground lg:px-14 lg:py-12">
        <div>
          <p className="font-heading text-3xl">{siteConfig.name}</p>
          <p className="mt-2 text-xs tracking-[0.22em] text-accent uppercase">{siteConfig.tagline}</p>
        </div>
        <div className="my-8 hidden lg:block">
          <p className="max-w-md font-heading text-5xl leading-tight">Staff sign in</p>
          <ul className="mt-8 grid gap-3 text-sm text-[#E7E2D9]">
            <li>{siteConfig.address.formatted}</li>
            <li>
              {siteConfig.hours.days}, {siteConfig.hours.display}
            </li>
            <li>{siteConfig.contact.phoneDisplay}</li>
          </ul>
        </div>
        <p className="max-w-sm text-sm text-[#C8C4BA]">
          This page is for FK Marble staff. There is no public registration.
        </p>
      </section>
      <section className="flex items-center bg-surface px-6 py-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-heading text-4xl text-foreground">Staff sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in with the email and password for your staff account.
          </p>
          <LoginForm />
          <p className="mt-6 text-sm">
            <a href="/" className="text-foreground underline decoration-border underline-offset-4">
              Back to the website
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
