"use client";

import { Area, Check, Field, FormError, checkedValue, textValue, useCatalogueSave } from "@/components/admin/CatalogueForm";
import { useHindiAutofill } from "@/components/admin/useHindiAutofill";
import type { AdminProduct } from "@/services/admin-catalogue";

export function ProductForm({
  action,
  nextHref,
  product,
  categories,
  showPrices,
  showCost,
}: {
  action: string;
  nextHref: string;
  product: Partial<AdminProduct> & { categoryId: string };
  categories: Array<{ id: string; name: string }>;
  showPrices: boolean;
  showCost: boolean;
}) {
  const method = action.endsWith("/products") ? "POST" : "PATCH";
  const { error, pending, save } = useCatalogueSave(action, method, nextHref);
  const { formRef, onInput, flush } = useHindiAutofill();

  return (
    <form
      ref={formRef}
      className="mt-8 grid gap-4"
      onInput={onInput}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        void (async () => {
          await flush();
          void save(event, {
          name: textValue(form, "name"),
          nameHi: textValue(form, "nameHi"),
          slug: textValue(form, "slug"),
          description: textValue(form, "description"),
          descriptionHi: textValue(form, "descriptionHi"),
          categoryId: textValue(form, "categoryId"),
          material: textValue(form, "material"),
          materialHi: textValue(form, "materialHi"),
          size: textValue(form, "size"),
          thickness: textValue(form, "thickness"),
          finish: textValue(form, "finish"),
          finishHi: textValue(form, "finishHi"),
          color: textValue(form, "color"),
          colorHi: textValue(form, "colorHi"),
          usage: textValue(form, "usage"),
          usageHi: textValue(form, "usageHi"),
          availability: textValue(form, "availability"),
          availabilityHi: textValue(form, "availabilityHi"),
          price: showPrices ? textValue(form, "price") : (product.price ?? ""),
          wholesalePrice: showPrices ? textValue(form, "wholesalePrice") : (product.wholesalePrice ?? ""),
          costPrice: showCost ? textValue(form, "costPrice") : (product.costPrice ?? ""),
          priceUnit: showPrices ? textValue(form, "priceUnit") : (product.priceUnit ?? ""),
          showPrice: showPrices ? checkedValue(form, "showPrice") : Boolean(product.showPrice),
          isFeatured: checkedValue(form, "isFeatured"),
          isActive: checkedValue(form, "isActive"),
          isDemo: checkedValue(form, "isDemo"),
          });
        })();
      }}
    >
      <Field label="Name" name="name" defaultValue={product.name} required />
      <Field label="Hindi name" name="nameHi" defaultValue={product.nameHi} />
      <Field label="Slug" name="slug" defaultValue={product.slug} required />
      <label className="block text-sm font-medium text-foreground">
        Category
        <select
          name="categoryId"
          defaultValue={product.categoryId}
          className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <Area label="Description" name="description" defaultValue={product.description} required />
      <Area label="Hindi description" name="descriptionHi" defaultValue={product.descriptionHi} />
      <Field label="Material" name="material" defaultValue={product.material} required />
      <Field label="Hindi material" name="materialHi" defaultValue={product.materialHi} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Size" name="size" defaultValue={product.size} />
        <Field label="Thickness" name="thickness" defaultValue={product.thickness} />
        <Field label="Finish" name="finish" defaultValue={product.finish} />
        <Field label="Hindi finish" name="finishHi" defaultValue={product.finishHi} />
        <Field label="Color" name="color" defaultValue={product.color} />
        <Field label="Hindi color" name="colorHi" defaultValue={product.colorHi} />
      </div>
      <Field label="Usage" name="usage" defaultValue={product.usage} />
      <Field label="Hindi usage" name="usageHi" defaultValue={product.usageHi} />
      <Field label="Availability" name="availability" defaultValue={product.availability ?? "Confirm on enquiry"} required />
      <Field label="Hindi availability" name="availabilityHi" defaultValue={product.availabilityHi} />
      {showPrices ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Retail price" name="price" defaultValue={product.price} />
          <Field label="Wholesale price" name="wholesalePrice" defaultValue={product.wholesalePrice} />
          <label className="block text-sm font-medium text-foreground">
            Price unit
            <select
              name="priceUnit"
              defaultValue={product.priceUnit ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base"
            >
              <option value="">No unit</option>
              <option value="SQ_FT">Square feet</option>
              <option value="PIECE">Piece</option>
              <option value="SLAB">Slab</option>
            </select>
          </label>
          <Check label="Show the retail price on the website" name="showPrice" defaultChecked={Boolean(product.showPrice)} />
        </div>
      ) : null}
      {showCost ? <Field label="Cost price" name="costPrice" defaultValue={product.costPrice} /> : null}
      <Check label="Featured" name="isFeatured" defaultChecked={Boolean(product.isFeatured)} />
      <Check label="Active" name="isActive" defaultChecked={product.isActive !== false} />
      <Check label="Demo sample. Hidden from the public site." name="isDemo" defaultChecked={Boolean(product.isDemo)} />
      <p className="text-sm leading-6 text-muted-foreground">
        Hindi is filled from the English details. Size and thickness stay as measurements. Correct the Hindi before saving if you want different wording. The Hindi pages use the saved Hindi text.
      </p>
      <p className="text-sm leading-6 text-muted-foreground">
        Cost and wholesale prices stay off the public website. Leave a price blank when it is confirmed on enquiry.
      </p>
      <FormError message={error} />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving" : "Save product"}
      </button>
    </form>
  );
}
