import {
  applyCatalog,
  countCatalog,
  type CatalogCounts,
  type CatalogItem,
  type CatalogPage,
  type CatalogParams,
} from "@/lib/catalog/rules";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { byNewest, getIndex, isLeafKind } from "./map";
import { normalizeSearchText } from "./search";
import { loadStore } from "./store";

// Server side of the catalog. The rules themselves live in lib/catalog/rules.ts
// (shared with the browser).

export {
  DEFAULT_CATALOG_PARAMS,
  parseCatalogParams,
  type CatalogParams,
  type CatalogItem,
} from "@/lib/catalog/rules";

/**
 * Every published catalog work (poems, stories, novels and whole series) with
 * its prepared search text, newest first. Search covers the Hindi title and
 * synopsis (nukta-free) plus the Latin slug, so "barish" finds "बारिश की रात".
 * A series also offers part 1's "पढ़ें" (same rule as book cards).
 */
export async function getCatalogItems(locale: Locale = defaultLocale): Promise<CatalogItem[]> {
  const index = getIndex(await loadStore(), locale);
  return index.store.works
    .filter((row) => isLeafKind(row.kind) || row.kind === "series")
    .sort(byNewest)
    .map((row) => {
      const summary = index.summary(row);
      if (row.kind === "series") {
        const read = index.bookSummary(row).mainRelease;
        if (read && !summary.releases.some((r) => r.id === read.id)) summary.releases = [read, ...summary.releases];
      }
      return {
        ...summary,
        searchText: `${row.search_text ?? ""} ${normalizeSearchText(row.slug.replace(/-/g, " "))}`,
      };
    });
}

export type CatalogResult = CatalogPage<CatalogItem> & { counts: CatalogCounts };

/** Filters, sorts and paginates on the server (first render, tests). */
export async function getCatalog(
  params: CatalogParams,
  options: { savedSlugs?: string[]; locale?: Locale } = {},
): Promise<CatalogResult> {
  const all = await getCatalogItems(options.locale ?? defaultLocale);
  return { ...applyCatalog(all, params, options.savedSlugs), counts: countCatalog(all) };
}
