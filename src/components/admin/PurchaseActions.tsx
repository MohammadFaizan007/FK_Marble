"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/admin/CatalogueForm";

type Line = {
  id: string;
  productName: string;
  remaining: string;
};

export function PurchaseActions({
  orderId,
  status,
  canCreate,
  canApprove,
  lines,
}: {
  orderId: string;
  status: string;
  canCreate: boolean;
  canApprove: boolean;
  lines: Line[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const openLines = lines.filter((line) => Number(line.remaining) > 0);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  async function post(path: string, body?: unknown) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "The purchase order could not be updated.");
        return;
      }

      router.refresh();
    } catch {
      setError("The purchase order could not be updated.");
    } finally {
      setPending(false);
    }
  }

  const canCancel = (status === "DRAFT" && canCreate) || (status === "APPROVED" && canApprove);
  const canReceive = canCreate && (status === "APPROVED" || status === "PARTIALLY_RECEIVED");

  return (
    <div className="mt-6 grid gap-4">
      <div className="flex flex-wrap gap-3">
        {status === "DRAFT" && canApprove ? (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => void post(`/api/admin/purchases/${orderId}/approve`)}>
            {pending ? "Saving" : "Approve order"}
          </button>
        ) : null}
        {canCancel ? (
          <button type="button" className="btn btn-outline" disabled={pending} onClick={() => void post(`/api/admin/purchases/${orderId}/cancel`)}>
            Cancel order
          </button>
        ) : null}
      </div>
      {canReceive ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const received = openLines
              .map((line) => ({ purchaseOrderItemId: line.id, quantity: quantities[line.id]?.trim() ?? "" }))
              .filter((line) => line.quantity);
            void post(`/api/admin/purchases/${orderId}/receipts`, { lines: received });
          }}
        >
          <h2 className="font-heading text-2xl text-foreground">Receive goods</h2>
          <p className="text-sm text-muted-foreground">Enter only the quantity that arrived. Stock increases with this receipt.</p>
          {openLines.map((line) => (
            <label key={line.id} className="grid gap-2 text-sm font-medium text-foreground sm:grid-cols-[1fr_8rem] sm:items-center">
              <span>
                {line.productName}
                <span className="mt-1 block font-normal text-muted-foreground">{line.remaining} still due</span>
              </span>
              <input
                inputMode="decimal"
                value={quantities[line.id] ?? ""}
                onChange={(event) => setQuantities({ ...quantities, [line.id]: event.target.value })}
                className="w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ))}
          <button type="submit" className="btn btn-primary w-fit" disabled={pending}>
            {pending ? "Saving" : "Save receipt"}
          </button>
        </form>
      ) : null}
      <FormError message={error} />
    </div>
  );
}
