import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, enabledLocales } from "@/lib/i18n/config";
import { refreshAdminSession } from "@/lib/supabase/proxy";

const ADMIN = "/admin";
const ADMIN_LOGIN = "/admin/login";
const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

// Hindi lives at "/" with no prefix: "/x" is served from "/hi/x" internally.
// Other enabled languages keep their prefix ("/en/x").
// The admin lives at "/admin" only (English, no language prefix).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const defaultPrefix = `/${defaultLocale}`;

  if (isUnder(pathname, ADMIN)) return admin(request);

  // "/en/admin…" (or any other prefix): the admin has one address.
  const prefixedAdmin = enabledLocales.find((locale) => isUnder(pathname, `/${locale}${ADMIN}`));
  if (prefixedAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(prefixedAdmin.length + 1);
    return NextResponse.redirect(url, 308);
  }

  // "/hi/x" typed directly: redirect to "/x" so each page has one URL.
  if (pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultPrefix.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const hasOtherLocale = enabledLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasOtherLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `${defaultPrefix}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

// Keeps the login fresh and sends signed-out visitors to the login page.
// Admin pages are never indexed.
async function admin(request: NextRequest) {
  const { response, signedIn } = await refreshAdminSession(request);
  let result = response;
  if (!signedIn && request.nextUrl.pathname !== ADMIN_LOGIN) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.search = "";
    result = NextResponse.redirect(url, 307);
    // Carry over any cookie changes (e.g. an expired session being cleared).
    response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie));
  }
  result.headers.set("X-Robots-Tag", "noindex, nofollow");
  return result;
}

export const config = {
  // Skip Next.js internals, API routes and files with an extension (images, robots.txt…).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
