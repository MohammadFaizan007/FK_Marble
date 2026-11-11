import { z } from "zod";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { hasPermission } from "@/lib/permissions";
import { consumeRateLimit } from "@/lib/rate-limit";
import { productHindiPairs, translateToHindi } from "@/lib/translate-hi";

const fieldSchema = z.string().trim().max(2000);

const requestSchema = z.object({
  fields: z
    .object({
      name: fieldSchema.optional(),
      description: fieldSchema.optional(),
      material: fieldSchema.optional(),
      finish: fieldSchema.optional(),
      color: fieldSchema.optional(),
      usage: fieldSchema.optional(),
      availability: fieldSchema.optional(),
    })
    .refine((fields) => Object.values(fields).some((value) => value), "Enter the English text."),
});

export async function POST(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "product.create") && !hasPermission(profile.role, "product.update")) {
    return apiError("You do not have permission for this action.", 403);
  }

  if (!consumeRateLimit(`translate:${profile.id}`, 60, 10 * 60 * 1000)) {
    return apiError("Hindi could not be filled just now. Wait a moment and continue.", 429);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const fields: Record<string, string> = {};

  for (const [englishKey] of productHindiPairs) {
    const value = parsed.data.fields[englishKey];

    if (!value) {
      continue;
    }

    fields[englishKey] = await translateToHindi(value);
  }

  return apiSuccess("Hindi text prepared", { fields });
}
