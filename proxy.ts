import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, enabledLocales } from "@/lib/i18n/config";

// Hindi lives at "/" with no prefix: "/x" is served from "/hi/x" internally.
// Other enabled languages keep their prefix ("/en/x").
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const defaultPrefix = `/${defaultLocale}`;

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

export const config = {
  // Skip Next.js internals, API routes and files with an extension (images, robots.txt…).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
