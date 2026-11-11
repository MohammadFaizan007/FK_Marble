"use client";

import { useState } from "react";
import { Area, Check, Field, FormError, checkedValue, textValue, useCatalogueSave } from "@/components/admin/CatalogueForm";
import { useHindiAutofill } from "@/components/admin/useHindiAutofill";

type CategoryValues = {
  name: string;
  nameHi: string | null;
  slug: string;
  description: string;
  descriptionHi: string | null;
  image: string;
  displayOrder: number;
  isActive: boolean;
};

export function CategoryForm({
  action,
  nextHref,
  initial,
}: {
  action: string;
  nextHref: string;
  initial: CategoryValues;
}) {
  const method = action.endsWith("/categories") ? "POST" : "PATCH";
  const { error, pending, save } = useCatalogueSave(action, method, nextHref);
  const { formRef, onInput, flush } = useHindiAutofill();
  const [image, setImage] = useState(initial.image);
  const [preview, setPreview] = useState(initial.image);
  const [localError, setLocalError] = useState("");
  const [uploading, setUploading] = useState(false);

  return (
    <form
      ref={formRef}
      className="mt-8 grid gap-4"
      onInput={onInput}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        void (async () => {
          setLocalError("");
          let nextImage = image;

          try {
            const file = form.elements.namedItem("imageFile");

            if (file instanceof HTMLInputElement && file.files?.[0]) {
              setUploading(true);
              const body = new FormData();
              body.set("file", file.files[0]);
              const response = await fetch("/api/admin/uploads", { method: "POST", body });
              const payload = (await response.json()) as { message?: string; data?: { image?: string } };

              if (!response.ok || !payload.data?.image) {
                setLocalError(payload.message || "The image could not be stored.");
                return;
              }

              nextImage = payload.data.image;
              setImage(nextImage);
            }
          } catch {
            setLocalError("The image could not be stored.");
            return;
          } finally {
            setUploading(false);
          }

          if (!nextImage) {
            setLocalError("Choose an image from your computer.");
            return;
          }

          await flush();
          void save(event, {
            name: textValue(form, "name"),
            nameHi: textValue(form, "nameHi"),
            slug: textValue(form, "slug"),
            description: textValue(form, "description"),
            descriptionHi: textValue(form, "descriptionHi"),
            image: nextImage,
            displayOrder: Number(textValue(form, "displayOrder")),
            isActive: checkedValue(form, "isActive"),
          });
        })();
      }}
    >
      <Field label="Name" name="name" defaultValue={initial.name} required />
      <Field label="Hindi name" name="nameHi" defaultValue={initial.nameHi} />
      <Field label="Slug" name="slug" defaultValue={initial.slug} required />
      <Area label="Description" name="description" defaultValue={initial.description} required />
      <Area label="Hindi description" name="descriptionHi" defaultValue={initial.descriptionHi} />
      <label className="block text-sm font-medium text-foreground">
        Category image
        <input
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : image);
          }}
        />
      </label>
      <p className="text-sm leading-6 text-muted-foreground">
        Choose a JPG, PNG, or WebP from your computer. The picture appears on the category card. The current picture stays until you choose a new one.
      </p>
      <p className="text-sm leading-6 text-muted-foreground">
        Hindi is filled from the English name and description. Correct it before saving if you want different wording. The Hindi pages use the saved Hindi text.
      </p>
      {preview ? (
        // The preview can be a file chosen on this computer, so it stays outside the image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-40 w-full rounded-md object-cover" />
      ) : (
        <p className="text-sm text-muted-foreground">No image chosen yet.</p>
      )}
      <Field label="Display order" name="displayOrder" defaultValue={String(initial.displayOrder)} required />
      <Check label="Active on the website" name="isActive" defaultChecked={initial.isActive} />
      <FormError message={localError || error} />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending || uploading}>
        {pending || uploading ? "Saving" : "Save category"}
      </button>
    </form>
  );
}
