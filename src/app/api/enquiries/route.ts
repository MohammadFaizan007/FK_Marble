import { chromeFor } from "@/i18n/chrome";
import { isLocale, type Locale } from "@/i18n/locale";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { enquirySchemaFor } from "@/lib/enquiry-schema";
import { consumeRateLimit, enquiryRateKey } from "@/lib/rate-limit";
import { createEnquiry } from "@/services/product-service";

function requestLocale(body: unknown): Locale {
  if (!body || typeof body !== "object" || !("locale" in body)) {
    return "en";
  }

  const locale = (body as { locale?: unknown }).locale;
  return typeof locale === "string" && isLocale(locale) ? locale : "en";
}

function withoutLocale(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const { locale: _locale, ...rest } = body as Record<string, unknown>;
  return rest;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(chromeFor("en").validation.json, 400);
  }

  const copy = chromeFor(requestLocale(body));

  if (!consumeRateLimit(`enquiry:${enquiryRateKey(request)}`)) {
    return apiError(copy.validation.rateLimit, 429);
  }

  const parsed = enquirySchemaFor(requestLocale(body)).safeParse(withoutLocale(body));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error, copy.validation.summary);
  }

  const result = await createEnquiry(parsed.data);

  if (!result.ok && result.code === "invalid_product") {
    return apiError(result.message, 400, [{ field: "productId", message: result.message }]);
  }

  if (!result.ok) {
    return apiError(result.message, 503);
  }

  return apiSuccess("Enquiry saved successfully", result.data, {}, 201);
}
