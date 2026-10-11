"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDownIcon, CloseIcon, FilterIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkRow } from "@/components/work/work-row";
import {
  applyCatalog,
  buildCatalogQuery,
  hasActiveFilters,
  PAGE_SIZES,
  CATALOG_SORTS,
  parseCatalogParams,
  type CatalogCounts,
  type CatalogItem,
  type CatalogParams,
  type CatalogSort,
  type PageSize,
} from "@/lib/catalog/rules";
import type { Genre, Platform } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";
import { useSavedWorks } from "@/lib/saved";
import { FilterGroups } from "./filter-groups";
import { KindChips } from "./kind-chips";
import { Pagination } from "./pagination";
import { SearchBar } from "./search-bar";

type Props = {
  items: CatalogItem[];
  counts: CatalogCounts;
  genres: Genre[];
  platforms: Platform[];
  locale: Locale;
  messages: Pick<Messages, "catalog" | "release" | "a11y" | "kinds" | "work" | "save" | "site" | "book">;
};

// True after hydration (false during the server render and the first client render).
const subscribeNoop = () => () => {};
const useHydrated = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

/**
 * The रचनाएँ browser (DESIGN.md §7.2). The URL is the single source of truth
 * (CLAUDE.md "Catalog state lives in the URL"): every change writes the query
 * with the History API, which Next.js syncs into useSearchParams. Typing
 * replaces the history entry; other changes push one, so Back restores them.
 * Filtering runs here on the full list, using the same rules as the server.
 */
export function CatalogBrowser({ items, counts, genres, platforms, locale, messages: m }: Props) {
  const c = m.catalog;
  // Built from the locale, not usePathname(): the router can report the internal /hi/… path.
  const pathname = routesFor(locale).works;
  const searchParams = useSearchParams();
  const params = useMemo(() => parseCatalogParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const hydrated = useHydrated();
  const { slugs: savedSlugs } = useSavedWorks();

  // Search text is local for instant typing; kept in sync with the URL (Back/Forward).
  const [query, setQuery] = useState(params.q);
  const [lastQ, setLastQ] = useState(params.q);
  if (params.q !== lastQ) {
    setLastQ(params.q);
    setQuery(params.q);
  }

  const [panelOpen, setPanelOpen] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const scrollPending = useRef(false);

  const navigate = (next: CatalogParams, mode: "push" | "replace" = "push") => {
    const url = `${pathname}${buildCatalogQuery(next)}`;
    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
  };
  /** Any change other than the page resets to page 1 (CLAUDE.md). */
  const update = (patch: Partial<CatalogParams>) => navigate({ ...params, q: query, ...patch, page: 1 });
  const goToPage = (page: number) => {
    scrollPending.current = true;
    navigate({ ...params, q: query, page });
  };
  const onQuery = (q: string) => {
    setQuery(q);
    setLastQ(q.trim().slice(0, 100));
    navigate({ ...params, q, page: 1 }, "replace");
  };
  const clearAll = () => {
    setQuery("");
    setLastQ("");
    navigate({ ...params, q: "", kinds: [], formats: [], genres: [], platforms: [], saved: false, page: 1 });
  };

  // On page change, bring the top of the results into view.
  useEffect(() => {
    if (!scrollPending.current) return;
    scrollPending.current = false;
    resultsRef.current?.scrollIntoView({ block: "start" });
    resultsRef.current?.focus({ preventScroll: true });
  }, [params.page]);

  const effective = { ...params, q: query };
  const result = applyCatalog(items, effective, savedSlugs);
  const itemSlugs = useMemo(() => new Set(items.map((w) => w.slug)), [items]);
  const savedCount = savedSlugs.filter((s) => itemSlugs.has(s)).length;
  // The saved list is only known in the browser: don't flash an empty state before it's read.
  const waitingForSaved = params.saved && !hydrated;

  const activeCount =
    params.formats.length + params.genres.length + params.platforms.length + (params.saved ? 1 : 0);

  // Active-filter chips, one per filter (DESIGN.md §6.12).
  const genreName = new Map(genres.map((g) => [g.slug, g.name]));
  const platformName = new Map(platforms.map((p) => [p.slug, p.name]));
  const chips: Array<{ key: string; label: string; remove: () => void }> = [
    ...(query.trim() ? [{ key: "q", label: format(c.active.search, { q: query.trim() }), remove: () => onQuery("") }] : []),
    ...params.kinds.map((k) => ({ key: `k-${k}`, label: c.kinds[k], remove: () => update({ kinds: params.kinds.filter((x) => x !== k) }) })),
    ...params.formats.map((f) => ({
      key: `f-${f}`,
      label: f === "audiobook" ? c.active.audiobookShort : c.filters.formats[f],
      remove: () => update({ formats: params.formats.filter((x) => x !== f) }),
    })),
    ...params.genres.map((g) => ({ key: `g-${g}`, label: genreName.get(g) ?? g, remove: () => update({ genres: params.genres.filter((x) => x !== g) }) })),
    ...params.platforms.map((p) => ({ key: `p-${p}`, label: platformName.get(p) ?? p, remove: () => update({ platforms: params.platforms.filter((x) => x !== p) }) })),
    ...(params.saved ? [{ key: "saved", label: c.active.saved, remove: () => update({ saved: false }) }] : []),
  ];

  const countText = (() => {
    const { total, totalAll } = result;
    if (total === totalAll) return total === 1 ? c.results.countOne : format(c.results.count, { count: total });
    return total === 1
      ? format(c.results.countOfOne, { total: totalAll })
      : format(c.results.countOf, { count: total, total: totalAll });
  })();

  const filterProps = {
    params,
    counts,
    savedCount,
    genres,
    platforms,
    onChange: update,
    messages: c,
  };
  const clearAllButton = (extra = "") => (
    <button
      type="button"
      onClick={clearAll}
      className={`relative min-h-11 text-ui font-semibold text-walnut underline underline-offset-4 ${extra}`}
    >
      {c.filters.clearAll}
    </button>
  );

  const selectClass =
    "h-12 rounded-control border border-line-strong bg-paper-raised pr-8 pl-3 text-ui text-ink";

  return (
    <div>
      <SearchBar value={query} onChange={onQuery} action={pathname} messages={c} />

      <div className="mt-6">
        <KindChips selected={params.kinds} onChange={(kinds) => update({ kinds })} messages={c} />
      </div>

      {/* Phone: "और फ़िल्टर" opens the groups inline below it. */}
      <div className="mt-5 desk:hidden">
        <button
          type="button"
          aria-expanded={panelOpen}
          aria-controls="catalog-filter-panel"
          onClick={() => setPanelOpen((o) => !o)}
          className="flex min-h-13 w-full items-center gap-3 rounded-control border border-line-strong bg-paper-raised px-4 text-ui font-semibold"
        >
          <FilterIcon size={18} />
          <span className="flex-1 text-left">
            {activeCount ? format(c.filters.moreCount, { count: activeCount }) : c.filters.more}
          </span>
          <ChevronDownIcon size={18} className={panelOpen ? "rotate-180" : ""} />
        </button>
        <div
          id="catalog-filter-panel"
          hidden={!panelOpen}
          className="rounded-b-control border border-t-0 border-line-strong bg-paper-raised px-4 pb-5"
        >
          <FilterGroups {...filterProps} idPrefix="phone" />
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="mt-3 flex min-h-13 w-full items-center justify-center rounded-control bg-walnut text-ui font-semibold text-on-walnut"
          >
            {result.total === 1 ? c.filters.showOne : format(c.filters.show, { count: result.total })}
          </button>
          {hasActiveFilters(params) && <div className="mt-2 text-center">{clearAllButton()}</div>}
        </div>
      </div>

      <div className="mt-8 grid gap-8 desk:grid-cols-[19.375rem_minmax(0,1fr)] desk:gap-14">
        {/* Desktop sidebar, always open */}
        <aside aria-label={c.filters.label} className="hidden self-start rounded-panel border border-line bg-paper-raised px-6 py-3 desk:block">
          <FilterGroups {...filterProps} idPrefix="side" />
          {hasActiveFilters(params) && <div className="border-t border-line pt-2 pb-1">{clearAllButton()}</div>}
        </aside>

        <section aria-labelledby="results-heading">
          {/* Results header: count, page size, sort; heavy rule beneath */}
          <div className="flex flex-col gap-3 border-b-2 border-ink pb-4 desk:flex-row desk:items-center desk:justify-between">
            <h2 id="results-heading" ref={resultsRef} tabIndex={-1} className="font-sans text-ui font-bold focus:outline-none">
              <span aria-live="polite">{waitingForSaved ? " " : countText}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-meta text-ink-soft">
                {c.results.perPage}
                <select
                  value={params.per}
                  onChange={(e) => update({ per: Number(e.target.value) as PageSize })}
                  className={selectClass}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-meta text-ink-soft">
                {c.results.sort}
                <select
                  value={params.sort}
                  onChange={(e) => update({ sort: e.target.value as CatalogSort })}
                  className={selectClass}
                >
                  {CATALOG_SORTS.map((s) => (
                    <option key={s} value={s}>
                      {c.results.sorts[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul aria-label={c.active.label} className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={format(c.active.remove, { label: chip.label })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-paper-raised px-4 text-ui hover:bg-label-paper"
                  >
                    {chip.label}
                    <CloseIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {waitingForSaved ? null : result.total === 0 ? (
            <EmptyState
              className="mt-6"
              heading={c.empty.heading}
              body={params.saved && savedCount === 0 && chips.length === 1 ? c.empty.savedBody : c.empty.body}
              action={
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex min-h-13 items-center justify-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark"
                >
                  {c.filters.clearAll}
                </button>
              }
            />
          ) : (
            <>
              <div>
                {result.items.map((work) => (
                  <WorkRow key={work.slug} work={work} locale={locale} messages={m} showThumbnail showSave />
                ))}
              </div>
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                total={result.total}
                per={result.per}
                hrefFor={(page) => `${pathname}${buildCatalogQuery({ ...params, q: query, page })}`}
                onNavigate={goToPage}
                messages={c.pagination}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
