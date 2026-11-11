"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminImage } from "@/services/admin-catalogue";

export function ImageEditor({ productId, images }: { productId: string; images: AdminImage[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function send(url: string, method: "POST" | "PATCH" | "DELETE", body?: Record<string, unknown>) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "The image could not be saved.");
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setError("The image could not be saved.");
      return false;
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="font-heading text-2xl text-foreground">Images</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Choose a JPG, PNG, or WebP from your computer. The first image is the primary picture on the product page.
      </p>
      <ul className="mt-4 grid gap-4">
        {images.map((image, index) => (
          <li key={image.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              <div>
              <p className="text-sm font-medium text-foreground">{image.altText}</p>
              <p className="mt-1 break-all text-sm text-muted-foreground">{image.imageUrl}</p>
              {image.isPrimary ? <p className="mt-1 text-xs tracking-[0.14em] text-accent uppercase">Primary</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline"
                disabled={pending || image.isPrimary}
                onClick={() => void send(`/api/admin/products/${productId}/images/${image.id}`, "PATCH", { direction: "primary" })}
              >
                Make primary
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={pending || index === 0}
                onClick={() => void send(`/api/admin/products/${productId}/images/${image.id}`, "PATCH", { direction: "up" })}
              >
                Up
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={pending || index === images.length - 1}
                onClick={() => void send(`/api/admin/products/${productId}/images/${image.id}`, "PATCH", { direction: "down" })}
              >
                Down
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={pending}
                onClick={() => {
                  if (window.confirm("Remove this image?")) {
                    void send(`/api/admin/products/${productId}/images/${image.id}`, "DELETE");
                  }
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          void (async () => {
            const file = data.get("imageFile");
            let imageUrl = String(data.get("imageUrl") ?? "").trim();

            if (file instanceof File && file.size > 0) {
              setPending(true);
              setError("");

              try {
                const body = new FormData();
                body.set("file", file);
                body.set("folder", "products");
                const uploaded = await fetch("/api/admin/uploads", { method: "POST", body });
                const payload = (await uploaded.json()) as { message?: string; data?: { image?: string } };

                if (!uploaded.ok || !payload.data?.image) {
                  setError(payload.message || "The image could not be stored.");
                  return;
                }

                imageUrl = payload.data.image;
              } catch {
                setError("The image could not be stored.");
                return;
              } finally {
                setPending(false);
              }
            }

            if (!imageUrl) {
              setError("Choose an image from your computer.");
              return;
            }

            const saved = await send(`/api/admin/products/${productId}/images`, "POST", {
              imageUrl,
              altText: String(data.get("altText") ?? ""),
            });

            if (saved) {
              form.reset();
            }
          })();
        }}
      >
        <label className="block text-sm font-medium text-foreground">
          Image file
          <input
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Image address, if the file is already on the web
          <input name="imageUrl" className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Image description
          <input name="altText" required className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5" />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-outline w-full sm:w-auto" disabled={pending}>
          Add image
        </button>
      </form>
    </section>
  );
}
