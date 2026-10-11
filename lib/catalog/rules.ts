// Catalog rules (docs/Data.md, "Catalog query rules"). Pure functions with no
// server or browser dependencies, so the server's first render and the
// browser's instant filtering use exactly the same logic.

import { normalizeSearchText } from "@/lib/data/search";
import { LEAF_KINDS, type LeafKind, type WorkSummary } from "@/lib/data/types";

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
  /** URL `saved=1`. The slugs themselves live in the browser. */
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

/** A catalog work plus its prepared search text (nukta-free title + synopsis + slug words). */
export type CatalogItem = WorkSummary & { searchText: string };

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
export function parseCatalogParams(sp: SearchParams | URLSearchParams): CatalogParams {
  const get = (key: string): string | string[] | undefined =>
    sp instanceof URLSearchParams ? (sp.getAll(key).length ? sp.getAll(key) : undefined) : sp[key];
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const d = DEFAULT_CATALOG_PARAMS;
  const page = Number(first(get("page")));
  return {
    q: (first(get("q")) ?? "").trim().slice(0, 100),
    kinds: list(get("kind")).filter((k): k is LeafKind => (LEAF_KINDS as readonly string[]).includes(k)),
    formats: list(get("format")).filter((f): f is CatalogFormat => (CATALOG_FORMATS as readonly string[]).includes(f)),
    genres: list(get("genre")).filter((g) => /^[a-z0-9-]+$/.test(g)),
    platforms: list(get("platform")).filter((p) => /^[a-z0-9-]+$/.test(p)),
    saved: first(get("saved")) === "1",
    sort: oneOf(CATALOG_SORTS, first(get("sort")), d.sort),
    per: oneOf(PAGE_SIZES, Number(first(get("per"))), d.per),
    page: Number.isInteger(page) && page >= 1 ? page : d.page,
  };
}

/** URL query for the given state; defaults are left out ("" for the default view). */
export function buildCatalogQuery(p: CatalogParams): string {
  const d = DEFAULT_CATALOG_PARAMS;
  const qs = new URLSearchParams();
  if (p.q.trim()) qs.set("q", p.q.trim());
  if (p.kinds.length) qs.set("kind", p.kinds.join(","));
  if (p.formats.length) qs.set("format", p.formats.join(","));
  if (p.genres.length) qs.set("genre", p.genres.join(","));
  if (p.platforms.length) qs.set("platform", p.platforms.join(","));
  if (p.saved) qs.set("saved", "1");
  if (p.sort !== d.sort) qs.set("sort", p.sort);
  if (p.per !== d.per) qs.set("per", String(p.per));
  if (p.page !== d.page) qs.set("page", String(p.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** True when any filter (not sort/size/page) is active. */
export function hasActiveFilters(p: CatalogParams): boolean {
  return !!(p.q.trim() || p.kinds.length || p.formats.length || p.genres.length || p.platforms.length || p.saved);
}

export type CatalogCounts = {
  kinds: Record<string, number>;
  formats: Record<string, number>;
  genres: Record<string, number>;
  platforms: Record<string, number>;
};

/** Counts beside filter options: totals over all catalog works, not per selection. */
export function countCatalog(items: WorkSummary[]): CatalogCounts {
  const counts: CatalogCounts = { kinds: {}, formats: {}, genres: {}, platforms: {} };
  const inc = (r: Record<string, number>, k: string) => (r[k] = (r[k] ?? 0) + 1);
  for (const w of items) {
    inc(counts.kinds, w.kind);
    for (const f of new Set(w.releases.map((r) => r.format))) inc(counts.formats, f);
    for (const g of w.genres) inc(counts.genres, g.slug);
    for (const p of new Set(w.releases.map((r) => r.platform.slug))) inc(counts.platforms, p);
  }
  return counts;
}

export type CatalogPage<T> = {
  items: T[];
  /** Works matching the current filters. */
  total: number;
  /** All catalog works ("34 में से 3"). */
  totalAll: number;
  page: number;
  per: PageSize;
  pageCount: number;
};

const newest = (a: WorkSummary, b: WorkSummary) => (b.publishedOn ?? "").localeCompare(a.publishedOn ?? "");

/**
 * Filters (OR within a group, AND across groups), sorts and paginates.
 * `savedSlugs` is only used when `params.saved` is on.
 */
export function applyCatalog<T extends CatalogItem>(
  all: T[],
  params: CatalogParams,
  savedSlugs: readonly string[] = [],
): CatalogPage<T> {
  const query = normalizeSearchText(params.q);
  const saved = params.saved ? new Set(savedSlugs) : null;

  const matches = all.filter((w) => {
    if (query && !w.searchText.includes(query)) return false;
    if (params.kinds.length && !params.kinds.includes(w.kind as LeafKind)) return false;
    if (params.formats.length && !w.releases.some((r) => (params.formats as string[]).includes(r.format))) return false;
    if (params.genres.length && !w.genres.some((g) => params.genres.includes(g.slug))) return false;
    if (params.platforms.length && !w.releases.some((r) => params.platforms.includes(r.platform.slug))) return false;
    if (saved && !saved.has(w.slug)) return false;
    return true;
  });

  const collator = new Intl.Collator("hi");
  matches.sort((a, b) => {
    if (params.sort === "title") return collator.compare(a.title, b.title);
    return params.sort === "old" ? -newest(a, b) : newest(a, b);
  });

  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / params.per));
  // Out-of-range pages fall back to the default (page 1), like other invalid values.
  const page = params.page <= pageCount ? params.page : 1;
  const start = (page - 1) * params.per;

  return {
    items: matches.slice(start, start + params.per),
    total,
    totalAll: all.length,
    page,
    per: params.per,
    pageCount,
  };
}
