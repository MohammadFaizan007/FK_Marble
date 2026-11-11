"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/admin/CatalogueForm";

type Line = {
  id: string;
  productName: string;
  toReserve: string;
  toDispatch: string;
  available: string;
};

export function SalesActions({
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
  const [reserveQty, setReserveQty] = useState<Record<string, string>>({});
  const [dispatchQty, setDispatchQty] = useState<Record<string, string>>({});
  const reserveLines = lines.filter((line) => Number(line.toReserve) > 0);
  const dispatchLines = lines.filter((line) => Number(line.toDispatch) > 0);

  async function post(path: string, body?: unknown) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = (await response.json()) as { message?: string; errors?: { message?: string }[] };

      if (!response.ok) {
        setError(payload.errors?.map((item) => item.message).filter(Boolean).join(" ") || payload.message || "The sales order could not be updated.");
        return;
      }

      router.refresh();
    } catch {
      setError("The sales order could not be updated.");
    } finally {
      setPending(false);
    }
  }

  const canCancel = (status === "DRAFT" && canCreate) || (status === "APPROVED" && canApprove);
  const canReserve = canCreate && (status === "APPROVED" || status === "PARTIALLY_RESERVED" || status === "RESERVED");
  const canDispatch = canCreate && (status === "PARTIALLY_RESERVED" || status === "RESERVED" || status === "PARTIALLY_DISPATCHED");

  return (
    <div className="mt-6 grid gap-4">
      <div className="flex flex-wrap gap-3">
        {status === "DRAFT" && canApprove ? (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => void post(`/api/admin/sales/${orderId}/approve`)}>
            {pending ? "Saving" : "Approve order"}
          </button>
        ) : null}
        {canCancel ? (
          <button type="button" className="btn btn-outline" disabled={pending} onClick={() => void post(`/api/admin/sales/${orderId}/cancel`)}>
            Cancel order
          </button>
        ) : null}
      </div>
      {canReserve && reserveLines.length > 0 ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const reserved = reserveLines
              .map((line) => ({ salesOrderItemId: line.id, quantity: reserveQty[line.id]?.trim() ?? "" }))
              .filter((line) => line.quantity);
            void post(`/api/admin/sales/${orderId}/reservations`, { lines: reserved });
          }}
        >
          <h2 className="font-heading text-2xl text-foreground">Reserve goods</h2>
          <p className="text-sm text-muted-foreground">Reserve only the quantity that is still free. This holds stock for the customer.</p>
          {reserveLines.map((line) => (
            <label key={line.id} className="grid gap-2 text-sm font-medium text-foreground sm:grid-cols-[1fr_8rem] sm:items-center">
              <span>
                {line.productName}
                <span className="mt-1 block font-normal text-muted-foreground">
                  {line.toReserve} still to reserve · {line.available} available
                </span>
              </span>
              <input
                inputMode="decimal"
                value={reserveQty[line.id] ?? ""}
                onChange={(event) => setReserveQty({ ...reserveQty, [line.id]: event.target.value })}
                className="w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ))}
          <FormError message={error} />
          <button type="submit" className="btn btn-primary w-fit" disabled={pending}>
            {pending ? "Saving" : "Reserve goods"}
          </button>
        </form>
      ) : null}
      {canDispatch && dispatchLines.length > 0 ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const dispatched = dispatchLines
              .map((line) => ({ salesOrderItemId: line.id, quantity: dispatchQty[line.id]?.trim() ?? "" }))
              .filter((line) => line.quantity);
            void post(`/api/admin/sales/${orderId}/dispatches`, { notes: "", lines: dispatched });
          }}
        >
          <h2 className="font-heading text-2xl text-foreground">Dispatch goods</h2>
          <p className="text-sm text-muted-foreground">Dispatch only a reserved quantity. Stock on hand decreases with this dispatch.</p>
          {dispatchLines.map((line) => (
            <label key={line.id} className="grid gap-2 text-sm font-medium text-foreground sm:grid-cols-[1fr_8rem] sm:items-center">
              <span>
                {line.productName}
                <span className="mt-1 block font-normal text-muted-foreground">{line.toDispatch} still reserved</span>
              </span>
              <input
                inputMode="decimal"
                value={dispatchQty[line.id] ?? ""}
                onChange={(event) => setDispatchQty({ ...dispatchQty, [line.id]: event.target.value })}
                className="w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ))}
          <button type="submit" className="btn btn-primary w-fit" disabled={pending}>
            {pending ? "Saving" : "Dispatch goods"}
          </button>
        </form>
      ) : null}
      {canReserve && reserveLines.length > 0 ? null : <FormError message={error} />}
    </div>
  );
}
