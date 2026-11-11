import { loginAdmin, loginSchema } from "@/lib/admin-auth";
import { sessionCookieHeader } from "@/lib/admin-session";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { consumeRateLimit, enquiryRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!consumeRateLimit(`admin-login:${enquiryRateKey(request)}`, 5, 15 * 60 * 1000)) {
    return apiError("Too many sign-in attempts. Please try again later.", 429);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const result = await loginAdmin(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return apiError("Email or password is incorrect.", 401);
  }

  const response = apiSuccess("Signed in successfully", result.profile);
  response.headers.append("Set-Cookie", sessionCookieHeader(result.token, result.expiresAt));
  return response;
}
