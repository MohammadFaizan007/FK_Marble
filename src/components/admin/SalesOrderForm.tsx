"use client";

import { useState } from "react";
import { FormError, useCatalogueSave } from "@/components/admin/CatalogueForm";

type Choice = { id: string; name: string };

export function SalesOrderForm({ customers, products }: { customers: Choice[]; products: Choice[] }) {
  const { error, pending, save } = useCatalogueSave("/api/admin/sales", "POST", "/admin/sales");
  const [lines, setLines] = useState([{ productId: products[0]?.id ?? "", quantity: "" }]);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        const form = event.currentTarget;
        const notes = new FormData(form).get("notes");
        void save(event, {
          customerId: new FormData(form).get("customerId"),
          notes: typeof notes === "string" ? notes : "",
          items: lines,
        });
      }}
    >
      <label className="block text-sm font-medium text-foreground">
        Customer
        <select
          name="customerId"
          required
          defaultValue={customers[0]?.id ?? ""}
          className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3">
        {lines.map((line, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_8rem]">
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
                className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
        ))}
      </div>
      {lines.length < 30 ? (
        <button
          type="button"
          className="btn btn-outline w-fit"
          onClick={() => setLines([...lines, { productId: products[0]?.id ?? "", quantity: "" }])}
        >
          Add product
        </button>
      ) : null}
      <label className="block text-sm font-medium text-foreground">
        Notes
        <textarea
          name="notes"
          rows={3}
          className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <p className="text-sm leading-6 text-muted-foreground">
        This order records quantities. Prices, invoices, and payments stay off this page. Reserving goods holds stock.
        Dispatch reduces the quantity on hand.
      </p>
      <FormError message={error} />
      <button type="submit" className="btn btn-primary w-fit" disabled={pending}>
        {pending ? "Saving" : "Save draft"}
      </button>
    </form>
  );
}
