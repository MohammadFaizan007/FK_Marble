import { revokeAdminSession } from "@/lib/admin-auth";
import { clearSessionCookieHeader, readSessionToken } from "@/lib/admin-session";
import { apiSuccess } from "@/lib/api-response";

export async function POST(request: Request) {
  await revokeAdminSession(readSessionToken(request));
  const response = apiSuccess("Signed out successfully", { signedIn: false });
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}
