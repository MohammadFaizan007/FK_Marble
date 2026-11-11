import { createHash, randomBytes } from "node:crypto";

export const adminSessionCookieName = "fk-marble-admin-session";
export const adminSessionHours = 12;

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function sessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + adminSessionHours * 60 * 60 * 1000);
}

export function readSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie");

  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");

    if (name === adminSessionCookieName) {
      const value = rest.join("=").trim();
      return value.length > 0 ? value : null;
    }
  }

  return null;
}

export function sessionCookieHeader(token: string, expiresAt: Date): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${adminSessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
}

export function clearSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${adminSessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
