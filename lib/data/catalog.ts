import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { byNewest, getIndex } from "./map";
import { normalizeSearchText } from "./search";
import { loadStore } from "./store";
import { LEAF_KINDS, type LeafKind, type WorkSummary } from "./types";

// Catalog rules: docs/Data.md, "Catalog query rules".

export const CATALOG_FORMATS = ["online", "audiobook", "print"] as const;
export type CatalogFormat = (typeof CATALOG_FORMATS)[number];

export const CATALOG_SORTS = ["new", "old", "title"] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export type CatalogParams = {
  q: string;
  kinds: LeafKind[];
  formats: CatalogFormat[];
  genres: string[];
  platforms: string[];
  /** URL `saved=1`. The slugs themselves live in the browser, see `savedSlugs`. */
  saved: boolean;
  sort: CatalogSort;
  per: PageSize;
  page: number;
};

export const DEFAULT_CATALOG_PARAMS: CatalogParams = {
  q: "",
  kinds: [],
  formats: [],
  genres: [],
  platforms: [],
  saved: false,
  sort: "new",
  per: 10,
  page: 1,
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Comma-separated or repeated params, e.g. `kind=story,poem` or `kind=story&kind=poem`. */
function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(raw.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean))];
}

function oneOf<T extends string | number>(allowed: readonly T[], value: unknown, fallback: T): T {
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;
}

/** Reads the catalog's URL state. Invalid values fall back to defaults. */
export function parseCatalogParams(sp: SearchParams): CatalogParams {
  const d = DEFAULT_CATALOG_PARAMS;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const page = Number(first(sp.page));
  return {
    q: (first(sp.q) ?? "").trim().slice(0, 100),
    kinds: list(sp.kind).filter((k): k is LeafKind => (LEAF_KINDS as readonly string[]).includes(k)),
    formats: list(sp.format).filter((f): f is CatalogFormat => (CATALOG_FORMATS as readonly string[]).includes(f)),
    genres: list(sp.genre).filter((g) => /^[a-z0-9-]+$/.test(g)),
    platforms: list(sp.platform).filter((p) => /^[a-z0-9-]+$/.test(p)),
    saved: first(sp.saved) === "1",
    sort: oneOf(CATALOG_SORTS, first(sp.sort), d.sort),
    per: oneOf(PAGE_SIZES, Number(first(sp.per)), d.per),
    page: Number.isInteger(page) && page >= 1 ? page : d.page,
  };
}

export type CatalogResult = {
  items: WorkSummary[];
  /** Works matching the current filters. */
  total: number;
  /** All published catalog works ("34 में से 3"). */
  totalAll: number;
  page: number;
  per: PageSize;
  pageCount: number;
  /** Counts beside filter options: totals over all published catalog works, not per selection. */
  counts: {
    kinds: Record<string, number>;
    formats: Record<string, number>;
    genres: Record<string, number>;
    platforms: Record<string, number>;
  };
};

const increment = (record: Record<string, number>, key: string) => {
  record[key] = (record[key] ?? 0) + 1;
};

/**
 * Filters, sorts and paginates the catalog.
 * `savedSlugs` comes from the reader's browser (localStorage); it is used only
 * when `params.saved` is on, and its order is ignored (the chosen sort applies).
 */
export async function getCatalog(
  params: CatalogParams,
  options: { savedSlugs?: string[]; locale?: Locale } = {},
): Promise<CatalogResult> {
  const index = getIndex(await loadStore(), options.locale ?? defaultLocale);
  const all = index.leafWorks().map((w) => ({ row: w, work: index.summary(w) }));

  const counts: CatalogResult["counts"] = { kinds: {}, formats: {}, genres: {}, platforms: {} };
  for (const { work } of all) {
    increment(counts.kinds, work.kind);
    for (const f of new Set(work.releases.map((r) => r.format))) increment(counts.formats, f);
    for (const g of work.genres) increment(counts.genres, g.slug);
    for (const p of new Set(work.releases.map((r) => r.platform.slug))) increment(counts.platforms, p);
  }

  const query = normalizeSearchText(params.q);
  const saved = params.saved ? new Set(options.savedSlugs ?? []) : null;

  // OR within a group, AND across groups.
  const matches = all.filter(({ row, work }) => {
    if (query && !(row.search_text ?? "").includes(query)) return false;
    if (params.kinds.length && !params.kinds.includes(work.kind as LeafKind)) return false;
    if (params.formats.length && !work.releases.some((r) => (params.formats as string[]).includes(r.format)))
      return false;
    if (params.genres.length && !work.genres.some((g) => params.genres.includes(g.slug))) return false;
    if (params.platforms.length && !work.releases.some((r) => params.platforms.includes(r.platform.slug)))
      return false;
    if (saved && !saved.has(work.slug)) return false;
    return true;
  });

  const collator = new Intl.Collator("hi");
  matches.sort((a, b) => {
    if (params.sort === "title") return collator.compare(a.work.title, b.work.title);
    const newest = byNewest(a.row, b.row);
    return params.sort === "old" ? -newest : newest;
  });

  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / params.per));
  // Out-of-range pages fall back to the default (page 1), like other invalid values.
  const page = params.page <= pageCount ? params.page : 1;
  const start = (page - 1) * params.per;

  return {
    items: matches.slice(start, start + params.per).map((m) => m.work),
    total,
    totalAll: all.length,
    page,
    per: params.per,
    pageCount,
    counts,
  };
}
