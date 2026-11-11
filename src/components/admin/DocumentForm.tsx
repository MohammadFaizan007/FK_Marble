"use client";

import { useState } from "react";
import { FormError, useCatalogueSave } from "@/components/admin/CatalogueForm";
import { documentUnitLabels, documentUnits } from "@/lib/document-schema";

type Choice = { id: string; name: string };

type Line = { productId: string; quantity: string; unit: (typeof documentUnits)[number]; rate: string };

const fieldClass =
  "mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DocumentForm({
  kind,
  action,
  method,
  nextHref,
  customers,
  products,
  initial,
}: {
  kind: "quotation" | "invoice";
  action: string;
  method: "POST" | "PATCH";
  nextHref: string;
  customers: Choice[];
  products: Choice[];
  initial?: { customerId: string; validUntil?: string; notes?: string | null; terms?: string | null; items: Line[] };
}) {
  const { error, pending, save } = useCatalogueSave(action, method, nextHref);
  const [lines, setLines] = useState<Line[]>(
    initial?.items.length ? initial.items : [{ productId: products[0]?.id ?? "", quantity: "", unit: "SQ_FT", rate: "" }],
  );

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        const form = new FormData(event.currentTarget);
        const body: Record<string, unknown> = {
          customerId: form.get("customerId"),
          notes: form.get("notes"),
          items: lines,
        };

        if (kind === "quotation") {
          body.validUntil = form.get("validUntil");
          body.terms = form.get("terms");
        }

        void save(event, body);
      }}
    >
      <label className="block text-sm font-medium text-foreground">
        Customer
        <select name="customerId" required defaultValue={initial?.customerId ?? customers[0]?.id ?? ""} className={fieldClass}>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3">
        {lines.map((line, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_7rem_9rem_8rem]">
            <label className="block text-sm font-medium text-foreground">
              Product
              <select
                required
                value={line.productId}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...line, productId: event.target.value };
                  setLines(next);
                }}
                className={fieldClass}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Quantity
              <input
                required
                inputMode="decimal"
                value={line.quantity}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...line, quantity: event.target.value };
                  setLines(next);
                }}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Unit
              <select
                value={line.unit}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...line, unit: event.target.value as Line["unit"] };
                  setLines(next);
                }}
                className={fieldClass}
              >
                {documentUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {documentUnitLabels[unit]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Rate
              <input
                required
                inputMode="decimal"
                value={line.rate}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...line, rate: event.target.value };
                  setLines(next);
                }}
                className={fieldClass}
              />
            </label>
          </div>
        ))}
      </div>
      {lines.length < 30 ? (
        <button
          type="button"
          className="btn btn-outline w-fit"
          onClick={() => setLines([...lines, { productId: products[0]?.id ?? "", quantity: "", unit: "SQ_FT", rate: "" }])}
        >
          Add product
        </button>
      ) : null}
      {kind === "quotation" ? (
        <label className="block text-sm font-medium text-foreground">
          Valid until
          <input type="date" name="validUntil" defaultValue={initial?.validUntil ?? ""} className={fieldClass} />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-foreground">
        Notes
        <textarea name="notes" rows={3} defaultValue={initial?.notes ?? ""} className={fieldClass} />
      </label>
      {kind === "quotation" ? (
        <label className="block text-sm font-medium text-foreground">
          Terms
          <textarea name="terms" rows={3} defaultValue={initial?.terms ?? ""} className={fieldClass} />
        </label>
      ) : null}
      <p className="text-sm leading-6 text-muted-foreground">
        {kind === "quotation"
          ? "The rate is the price offered to the customer. Cost, wholesale, tax, and payments stay off this page."
          : "Issuing an invoice gives it a permanent number. An issued invoice cannot be edited or deleted. Tax and payments stay off this page."}
      </p>
      <FormError message={error} />
      <button type="submit" className="btn btn-primary w-fit" disabled={pending}>
        {pending ? "Saving" : "Save draft"}
      </button>
    </form>
  );
}
