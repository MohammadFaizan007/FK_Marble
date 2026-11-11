"use client";

import { Area, Check, Field, FormError, checkedValue, textValue, useCatalogueSave } from "@/components/admin/CatalogueForm";
import { customerTypeLabels, customerTypes } from "@/lib/customer-schema";

type CustomerValues = {
  name: string;
  type: (typeof customerTypes)[number];
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  notes: string | null;
  isActive: boolean;
};

export function CustomerForm({
  action,
  nextHref,
  initial,
}: {
  action: string;
  nextHref: string;
  initial: CustomerValues;
}) {
  const method = action.endsWith("/customers") ? "POST" : "PATCH";
  const { error, pending, save } = useCatalogueSave(action, method, nextHref);

  return (
    <form
      className="mt-8 grid gap-4"
      onSubmit={(event) => {
        const form = event.currentTarget;
        void save(event, {
          name: textValue(form, "name"),
          type: textValue(form, "type"),
          contactName: textValue(form, "contactName"),
          phone: textValue(form, "phone"),
          email: textValue(form, "email"),
          address: textValue(form, "address"),
          gstin: textValue(form, "gstin"),
          notes: textValue(form, "notes"),
          isActive: checkedValue(form, "isActive"),
        });
      }}
    >
      <Field label="Customer name" name="name" defaultValue={initial.name} required />
      <label className="block text-sm font-medium text-foreground">
        Customer type
        <select
          name="type"
          required
          defaultValue={initial.type}
          className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {customerTypes.map((type) => (
            <option key={type} value={type}>
              {customerTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <Field label="Contact person" name="contactName" defaultValue={initial.contactName} />
      <Field label="Phone" name="phone" defaultValue={initial.phone} />
      <Field label="Email" name="email" defaultValue={initial.email} />
      <Area label="Address" name="address" defaultValue={initial.address} />
      <Field label="GSTIN" name="gstin" defaultValue={initial.gstin} />
      <Area label="Notes" name="notes" defaultValue={initial.notes} />
      <Check label="Active customer" name="isActive" defaultChecked={initial.isActive} />
      <p className="text-sm leading-6 text-muted-foreground">
        This record stores the customer and their type. Balances, credit limits, and payments stay off this page.
      </p>
      <FormError message={error} />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving" : "Save customer"}
      </button>
    </form>
  );
}
