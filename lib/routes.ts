import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

// Page addresses: English paths, Hinglish slugs (CLAUDE.md). Build every
// internal link with these so a rename happens in one place.
// Hindi (default) has no prefix; other languages get "/<locale>".

/** Unprefixed (Hindi) paths. Use `routesFor(locale)` when rendering links. */
export const routes = {
  home: "/",
  works: "/works",
  work: (slug: string) => `/work/${slug}`,
  books: "/books",
  book: (slug: string) => `/book/${slug}`,
  about: "/about",
} as const;

/** Adds the language prefix to an unprefixed path ("/works" → "/en/works"). */
export function localize(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** The same address builders as `routes`, prefixed for a language. */
export function routesFor(locale: Locale) {
  return {
    home: localize(routes.home, locale),
    works: localize(routes.works, locale),
    work: (slug: string) => localize(routes.work(slug), locale),
    books: localize(routes.books, locale),
    book: (slug: string) => localize(routes.book(slug), locale),
    about: localize(routes.about, locale),
  };
}

export type Routes = ReturnType<typeof routesFor>;
export type Section = "home" | "works" | "books" | "about";

const prefixOf = (pathname: string) =>
  locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

/** Language of a path: "/en/works" → "en", "/works" → "hi". */
export function localeOf(pathname: string): Locale {
  return prefixOf(pathname) ?? defaultLocale;
}

/**
 * The path without any language prefix. Pages are built under /hi/… and
 * /en/… internally, so the router can report "/hi" for "/".
 */
export function publicPath(pathname: string): string {
  const prefix = prefixOf(pathname);
  return prefix ? pathname.slice(prefix.length + 1) || "/" : pathname;
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

/** The same page in another language. */
export function localizedPath(pathname: string, locale: Locale): string {
  return localize(publicPath(pathname), locale);
}
