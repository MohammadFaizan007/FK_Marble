import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { localeCookieName, localeFromPathname, preferredLocalePath } from "@/i18n/locale";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const nextPath = preferredLocalePath(pathname, request.cookies.get(localeCookieName)?.value);

  if (nextPath) {
    const url = request.nextUrl.clone();
    url.pathname = nextPath;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  const pathLocale = localeFromPathname(pathname);

  if (pathLocale) {
    response.cookies.set(localeCookieName, pathLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
