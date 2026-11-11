import { catalogueTermHi } from "@/i18n/copy";

const chunkSize = 450;

export async function translateToHindi(
  text: string,
  remote: (text: string) => Promise<string> = remoteHindi,
): Promise<string> {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  const known = catalogueTermHi(trimmed);

  if (known) {
    return known;
  }

  const parts = splitText(trimmed);
  const translated: string[] = [];

  for (const part of parts) {
    const local = catalogueTermHi(part);

    if (local) {
      translated.push(local);
      continue;
    }

    const hindi = await remote(part).catch(() => "");
    translated.push(hindi || part);
  }

  return translated.join(" ").replace(/\s+/g, " ").trim();
}

export async function fillMissingHindi<T extends object>(
  input: T,
  pairs: ReadonlyArray<readonly [keyof T, keyof T]>,
): Promise<T> {
  const next = { ...input };

  for (const [englishKey, hindiKey] of pairs) {
    const english = typeof next[englishKey] === "string" ? next[englishKey].trim() : "";
    const hindi = typeof next[hindiKey] === "string" ? next[hindiKey].trim() : "";

    if (!english || hindi) {
      continue;
    }

    const translated = await translateToHindi(english);

    if (translated) {
      next[hindiKey] = translated as T[keyof T];
    }
  }

  return next;
}

export const categoryHindiPairs = [
  ["name", "nameHi"],
  ["description", "descriptionHi"],
] as const;

export const productHindiPairs = [
  ["name", "nameHi"],
  ["description", "descriptionHi"],
  ["material", "materialHi"],
  ["finish", "finishHi"],
  ["color", "colorHi"],
  ["usage", "usageHi"],
  ["availability", "availabilityHi"],
] as const;

async function remoteHindi(text: string): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "en|hi");
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

  if (!response.ok) {
    return "";
  }

  const payload = (await response.json()) as { responseData?: { translatedText?: unknown } };
  const translated = payload.responseData?.translatedText;
  if (typeof translated !== "string") {
    return "";
  }

  const value = translated.trim();
  if (!value || /MYMEMORY WARNING|QUERY LENGTH/i.test(value)) {
    return "";
  }

  return value;
}

function splitText(text: string) {
  if (text.length <= chunkSize) {
    return [text];
  }

  const parts: string[] = [];
  let rest = text;

  while (rest.length > chunkSize) {
    const slice = rest.slice(0, chunkSize);
    const breakAt = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf(" "));
    const cut = breakAt > 80 ? breakAt + 1 : chunkSize;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) {
    parts.push(rest);
  }

  return parts;
}
