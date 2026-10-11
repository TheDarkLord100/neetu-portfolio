import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

// Page addresses: English paths, Hinglish slugs (CLAUDE.md). Build every
// internal link with these so a rename happens in one place.

export const routes = {
  home: "/",
  works: "/works",
  work: (slug: string) => `/work/${slug}`,
  books: "/books",
  book: (slug: string) => `/book/${slug}`,
  about: "/about",
  search: (q: string) => `/works?q=${encodeURIComponent(q)}`,
} as const;

export type Section = "home" | "works" | "books" | "about";

/**
 * The public path without the hidden default-locale prefix. Pages are built
 * under /hi/… internally (proxy rewrite), so during prerender the router can
 * report "/hi" for "/".
 */
export function publicPath(pathname: string): string {
  const prefix = `/${defaultLocale}`;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}

/** Which top-level section a path belongs to (work pages → works, book pages → books). */
export function sectionOf(rawPathname: string): Section | null {
  const pathname = publicPath(rawPathname);
  if (pathname === "/") return "home";
  if (pathname === "/works" || pathname.startsWith("/work/")) return "works";
  if (pathname === "/books" || pathname.startsWith("/book/")) return "books";
  if (pathname === "/about") return "about";
  return null;
}

/** The same page in another language: Hindi has no prefix, others get "/<locale>". */
export function localizedPath(pathname: string, locale: Locale): string {
  let path = publicPath(pathname);
  const current = locales.find((l) => l !== defaultLocale && (path === `/${l}` || path.startsWith(`/${l}/`)));
  if (current) path = path.slice(current.length + 1) || "/";
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
