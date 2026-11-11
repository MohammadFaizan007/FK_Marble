"use client";

import { Area, Check, Field, FormError, checkedValue, textValue, useCatalogueSave } from "@/components/admin/CatalogueForm";

type SupplierValues = {
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  notes: string | null;
  isActive: boolean;
};

export function SupplierForm({
  action,
  nextHref,
  initial,
}: {
  action: string;
  nextHref: string;
  initial: SupplierValues;
}) {
  const method = action.endsWith("/suppliers") ? "POST" : "PATCH";
  const { error, pending, save } = useCatalogueSave(action, method, nextHref);

  return (
    <form
      className="mt-8 grid gap-4"
      onSubmit={(event) => {
        const form = event.currentTarget;
        void save(event, {
          name: textValue(form, "name"),
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
      <Field label="Supplier name" name="name" defaultValue={initial.name} required />
      <Field label="Contact person" name="contactName" defaultValue={initial.contactName} />
      <Field label="Phone" name="phone" defaultValue={initial.phone} />
      <Field label="Email" name="email" defaultValue={initial.email} />
      <Area label="Address" name="address" defaultValue={initial.address} />
      <Field label="GSTIN" name="gstin" defaultValue={initial.gstin} />
      <Area label="Notes" name="notes" defaultValue={initial.notes} />
      <Check label="Active supplier" name="isActive" defaultChecked={initial.isActive} />
      <p className="text-sm leading-6 text-muted-foreground">
        This record stores who supplies stone and surfaces. Purchases, stock, and payments stay off this page.
      </p>
      <FormError message={error} />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving" : "Save supplier"}
      </button>
    </form>
  );
}
