import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  return apiSuccess("Session fetched successfully", profile);
}
