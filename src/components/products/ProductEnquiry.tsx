"use client";

import { useState, type FormEvent } from "react";
import { useChrome } from "@/i18n/use-chrome";
import {
  enquiryTypes,
  quantityUnits,
} from "@/lib/enquiry-schema";
import { productEnquiryHref } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

type ProductEnquiryProps = {
  product: Product;
};

export function ProductEnquiry({ product }: ProductEnquiryProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<(typeof quantityUnits)[number]>("SQ_FT");
  const [enquiryType, setEnquiryType] = useState<(typeof enquiryTypes)[number]>("RETAIL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { locale, copy } = useChrome();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const amount = Number(quantity);

    if (name.trim().length < 2) {
      setError(copy.validation.name);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(copy.validation.quantity);
      return;
    }

    const payload = {
      customerName: name.trim(),
      phone: phone.trim(),
      email: null,
      productId: product.id,
      productName: product.name,
      enquiryType,
      quantity: amount,
      quantityUnit: unit,
      message: message.trim() || null,
      locale,
    };
    const whatsAppUrl = productEnquiryHref({
      name: payload.customerName,
      productName: product.name,
      category: product.categoryName,
      material: product.material,
      size: product.size,
      enquiryType: enquiryType === "WHOLESALE" ? copy.form.wholesale : copy.form.retail,
      quantity: String(amount),
      unit: copy.form.units[unit],
      message,
    });

    let response: Response;
    try {
      response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
      setNotice(copy.validation.storedFailed);
      return;
    }

    const body = (await response.json().catch(() => null)) as {
      message?: string;
      errors?: { message?: string }[];
    } | null;

    if (response.status === 400 || response.status === 429) {
      setError(body?.errors?.find((item) => item.message)?.message ?? body?.message ?? copy.validation.check);
      return;
    }

    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
    setNotice(response.ok ? copy.validation.saved : copy.validation.databaseFailed);
  }

  return (
    <section id="product-enquiry" aria-labelledby="enquiry-heading" className="scroll-mt-24 rounded-lg border border-border bg-surface p-5 sm:p-6">
      <h2 id="enquiry-heading" className="font-heading text-3xl text-foreground">
        {copy.form.heading}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.form.intro}</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="enquiry-name" className="text-sm text-foreground">
              {copy.form.name}
            </label>
            <input
              id="enquiry-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="enquiry-phone" className="text-sm text-foreground">
              {copy.form.phone}
            </label>
            <input
              id="enquiry-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              required
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base sm:text-sm"
            />
          </div>
        </div>
        <fieldset>
          <legend className="text-sm text-foreground">{copy.form.type}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {enquiryTypes.map((type) => (
              <label key={type} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="enquiry-type"
                  value={type}
                  checked={enquiryType === type}
                  onChange={() => setEnquiryType(type)}
                  className="size-4 accent-accent"
                />
                {type === "WHOLESALE" ? copy.form.wholesale : copy.form.retail}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="enquiry-quantity" className="text-sm text-foreground">
              {copy.form.quantity}
            </label>
            <input
              id="enquiry-quantity"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-base sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="enquiry-unit" className="text-sm text-foreground">
              {copy.form.unit}
            </label>
            <select
              id="enquiry-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value as (typeof quantityUnits)[number])}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {quantityUnits.map((option) => (
                <option key={option} value={option}>
                  {copy.form.units[option]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="enquiry-message" className="text-sm text-foreground">
            {copy.form.message} <span className="text-muted-foreground">({copy.form.optional})</span>
          </label>
          <textarea
            id="enquiry-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-base sm:text-sm"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        <button type="submit" className="btn btn-accent w-full sm:w-auto">
          {copy.form.submit}
        </button>
      </form>
    </section>
  );
}
