"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/admin/CatalogueForm";

export function DocumentActions({
  kind,
  id,
  status,
  customerId,
  salesOrderId,
  canEdit,
  canChangeLines = true,
  canIssue,
  hasOpenInvoice,
}: {
  kind: "quotation" | "invoice";
  id: string;
  status: string;
  customerId?: string;
  salesOrderId?: string | null;
  canEdit: boolean;
  canChangeLines?: boolean;
  canIssue: boolean;
  hasOpenInvoice?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");

  async function send(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = (await response.json()) as { message?: string; errors?: { message?: string }[]; data?: { id?: string } };

      if (!response.ok) {
        setError(payload.errors?.flatMap((item) => (item.message ? [item.message] : [])).join(" ") || payload.message || "The document could not be updated.");
        return;
      }

      if (method === "DELETE") {
        router.push(kind === "quotation" ? "/admin/quotations" : "/admin/invoices");
      } else if (path.endsWith("/revisions") && payload.data?.id) {
        router.push(`/admin/quotations/${payload.data.id}`);
      } else if (path === "/api/admin/invoices" && payload.data?.id) {
        router.push(`/admin/invoices/${payload.data.id}`);
      }

      router.refresh();
    } catch {
      setError("The document could not be updated.");
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  const quoteBase = `/api/admin/quotations/${id}`;
  const invoiceBase = `/api/admin/invoices/${id}`;

  return (
    <div className="mt-6 grid gap-4">
      <div className="flex flex-wrap gap-3">
        <a href={kind === "quotation" ? `${quoteBase}/pdf` : `${invoiceBase}/pdf`} className="btn btn-outline">
          Download PDF
        </a>
        {kind === "quotation" && status === "DRAFT" && canEdit && canChangeLines ? (
          <a href={`/admin/quotations/${id}/edit`} className="text-sm font-bold text-[#1F6B3A] underline">
            Edit
          </a>
        ) : null}
        {kind === "invoice" && status === "DRAFT" && canEdit && canChangeLines ? (
          <a href={`/admin/invoices/${id}/edit`} className="text-sm font-bold text-[#1F6B3A] underline">
            Edit
          </a>
        ) : null}
        {kind === "quotation" && canEdit && (status === "DRAFT" || status === "SENT") ? (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => void send(quoteBase, "PATCH", { status: status === "DRAFT" ? "SENT" : "ACCEPTED" })}>
            {status === "DRAFT" ? "Mark sent" : "Mark accepted"}
          </button>
        ) : null}
        {kind === "quotation" && canEdit && status === "DRAFT" ? (
          <button type="button" className="btn btn-outline" disabled={pending} onClick={() => void send(quoteBase, "PATCH", { status: "ACCEPTED" })}>
            Mark accepted
          </button>
        ) : null}
        {kind === "quotation" && canEdit && (status === "DRAFT" || status === "SENT") ? (
          <>
            <button type="button" className="btn btn-outline" disabled={pending} onClick={() => void send(quoteBase, "PATCH", { status: "REJECTED" })}>
              Mark rejected
            </button>
            <button type="button" className="btn btn-outline" disabled={pending} onClick={() => void send(quoteBase, "PATCH", { status: "EXPIRED" })}>
              Mark expired
            </button>
          </>
        ) : null}
        {kind === "quotation" && canEdit && status !== "DRAFT" && status !== "CONVERTED" ? (
          <button type="button" className="btn btn-outline" disabled={pending} onClick={() => void send(`${quoteBase}/revisions`, "POST", {})}>
            New revision
          </button>
        ) : null}
        {kind === "quotation" && canEdit && status === "ACCEPTED" && !salesOrderId ? (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => void send(`${quoteBase}/convert`, "POST", {})}>
            Convert to sales order
          </button>
        ) : null}
        {kind === "quotation" && canEdit && (status === "ACCEPTED" || status === "CONVERTED") && !hasOpenInvoice && customerId ? (
          <button
            type="button"
            className="btn btn-outline"
            disabled={pending}
            onClick={() => void send("/api/admin/invoices", "POST", { quotationId: id, customerId })}
          >
            Create invoice
          </button>
        ) : null}
        {kind === "invoice" && status === "DRAFT" && canIssue ? (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => void send(`${invoiceBase}/issue`, "POST", {})}>
            Issue invoice
          </button>
        ) : null}
        {status === "DRAFT" && canEdit && !confirming ? (
          <button type="button" className="text-sm font-bold text-destructive" onClick={() => setConfirming(true)}>
            Delete
          </button>
        ) : null}
        {status === "DRAFT" && canEdit && confirming ? (
          <>
            <button type="button" className="text-sm font-bold text-destructive" disabled={pending} onClick={() => void send(kind === "quotation" ? quoteBase : invoiceBase, "DELETE")}>
              Confirm delete
            </button>
            <button type="button" className="text-sm font-normal text-foreground" onClick={() => setConfirming(false)}>
              Keep
            </button>
          </>
        ) : null}
      </div>
      {kind === "invoice" && status === "ISSUED" && canIssue ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void send(`${invoiceBase}/cancel`, "POST", { reason });
          }}
        >
          <label className="block text-sm font-medium text-foreground">
            Reason for cancellation
            <input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <button type="submit" className="btn btn-outline w-fit" disabled={pending}>
            Cancel invoice
          </button>
        </form>
      ) : null}
      {salesOrderId ? (
        <a href={`/admin/sales/${salesOrderId}`} className="text-sm font-bold text-[#1F6B3A] underline">
          Open sales order
        </a>
      ) : null}
      <FormError message={error} />
    </div>
  );
}
