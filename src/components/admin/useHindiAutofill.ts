"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { productHindiPairs } from "@/lib/translate-hi";

const hindiName = new Map<string, string>(productHindiPairs);

export function useHindiAutofill() {
  const formRef = useRef<HTMLFormElement>(null);
  const timers = useRef(new Map<string, number>());
  const requests = useRef(new Map<string, AbortController>());
  const pending = useRef(new Map<string, Promise<void>>());

  useEffect(() => {
    const form = formRef.current;

    if (form) {
      for (const [english, hindi] of productHindiPairs) {
        const source = fieldElement(form, english);
        const target = fieldElement(form, hindi);

        if (source?.value.trim() && target && !target.value.trim()) {
          fillField(english, source.value, target, requests.current, pending.current);
        }
      }
    }

    const timerMap = timers.current;
    const requestMap = requests.current;

    return () => {
      for (const timer of timerMap.values()) {
        window.clearTimeout(timer);
      }

      for (const request of requestMap.values()) {
        request.abort();
      }
    };
  }, []);

  function onInput(event: FormEvent<HTMLFormElement>) {
    const source = event.target;

    if (!(source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement)) {
      return;
    }

    const hindi = hindiName.get(source.name);
    const form = formRef.current;

    if (!hindi || !form) {
      return;
    }

    const target = fieldElement(form, hindi);

    if (!target) {
      return;
    }

    const existing = timers.current.get(source.name);

    if (existing) {
      window.clearTimeout(existing);
    }

    timers.current.set(
      source.name,
      window.setTimeout(() => {
        timers.current.delete(source.name);
        fillField(source.name, source.value, target, requests.current, pending.current);
      }, 500),
    );
  }

  async function flush() {
    const form = formRef.current;

    for (const [name, timer] of timers.current) {
      window.clearTimeout(timer);
      const hindi = hindiName.get(name);
      const source = form ? fieldElement(form, name) : null;
      const target = form && hindi ? fieldElement(form, hindi) : null;

      if (source && target) {
        fillField(name, source.value, target, requests.current, pending.current);
      }
    }

    timers.current.clear();
    await Promise.all([...pending.current.values()]);
  }

  return { formRef, onInput, flush };
}

function fillField(
  englishName: string,
  value: string,
  target: HTMLInputElement | HTMLTextAreaElement,
  requests: Map<string, AbortController>,
  pending: Map<string, Promise<void>>,
) {
  const previous = requests.get(englishName);
  previous?.abort();
  const controller = new AbortController();
  requests.set(englishName, controller);
  const work = writeHindi(englishName, value, target, controller.signal);
  pending.set(englishName, work);
  void work.finally(() => {
    if (pending.get(englishName) === work) {
      pending.delete(englishName);
    }
  });
  return work;
}

async function writeHindi(
  englishName: string,
  value: string,
  target: HTMLInputElement | HTMLTextAreaElement,
  signal: AbortSignal,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    target.value = "";
    return;
  }

  try {
    const response = await fetch("/api/admin/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields: { [englishName]: trimmed } }),
      signal,
    });
    const payload = (await response.json()) as { data?: { fields?: Record<string, string> } };
    const hindi = payload.data?.fields?.[englishName];

    if (response.ok && hindi && !signal.aborted) {
      target.value = hindi;
    }
  } catch {
    // A failed translation leaves the current Hindi text in place.
  }
}

function fieldElement(form: HTMLFormElement, name: string) {
  const element = form.elements.namedItem(name);
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element : null;
}
