"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button type="button" className={className ?? "btn btn-outline"} onClick={signOut} disabled={pending}>
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
