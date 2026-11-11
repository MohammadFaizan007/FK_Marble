"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerActions({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "The customer could not be deleted.");
        setConfirming(false);
        return;
      }

      router.refresh();
    } catch {
      setError("The customer could not be deleted.");
      setConfirming(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-4">
        <a
          href={`/admin/customers/${id}`}
          className="text-sm font-bold text-[#1F6B3A] underline decoration-[#1F6B3A]/40 underline-offset-4"
        >
          Edit
        </a>
        {confirming ? (
          <>
            <button type="button" className="text-sm font-bold text-destructive" onClick={() => void remove()} disabled={pending}>
              {pending ? "Deleting" : "Confirm delete"}
            </button>
            <button type="button" className="text-sm font-normal text-foreground" onClick={() => setConfirming(false)} disabled={pending}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" className="text-sm font-bold text-destructive" onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </div>
      {error ? (
        <p role="alert" className="max-w-xs text-right text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
