import type { Locale } from "./config";

const INTL_LOCALE: Record<Locale, string> = { hi: "hi-IN", en: "en-IN" };

/**
 * "सितंबर 2026" from a "YYYY-MM-DD" date. Uses regular digits (DESIGN.md §3).
 * Parsed and formatted in UTC so the month never shifts with the server's timezone.
 */
export function formatMonthYear(isoDate: string | null, locale: Locale): string | null {
  if (!isoDate) return null;
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    numberingSystem: "latn",
  }).format(date);
}

/** Year only, e.g. for book cards. */
export function formatYear(isoDate: string | null): string | null {
  return isoDate ? isoDate.slice(0, 4) : null;
}
