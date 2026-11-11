"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldClass =
  "mt-2 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input name={name} defaultValue={defaultValue ?? ""} required={required} className={fieldClass} />
    </label>
  );
}

export function Area({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <textarea name={name} defaultValue={defaultValue ?? ""} required={required} rows={4} className={fieldClass} />
    </label>
  );
}

export function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-3 text-sm text-foreground">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1" />
      <span>{label}</span>
    </label>
  );
}

export function useCatalogueSave(url: string, method: "POST" | "PATCH", nextHref: string) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>, body: Record<string, unknown>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "The catalogue could not be saved.");
        return;
      }

      router.push(nextHref);
      router.refresh();
    } catch {
      setError("The catalogue could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return { error, pending, save };
}

export function FormError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function textValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement
    ? field.value
    : "";
}

export function checkedValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ? field.checked : false;
}
