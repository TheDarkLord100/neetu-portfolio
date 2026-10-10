import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { byNewest, getIndex, isLeafKind } from "./map";
import { loadStore } from "./store";
import type { BookSummary, WorkDetail, WorkSummary } from "./types";

/** A poem, story or novel for its work page; null if missing, unpublished or a book. */
export async function getWork(slug: string, locale: Locale = defaultLocale): Promise<WorkDetail | null> {
  const index = getIndex(await loadStore(), locale);
  const row = index.workBySlug.get(slug);
  if (!row || !isLeafKind(row.kind)) return null;

  const work = index.summary(row);
  const parent = index.parentSeries(row);
  const seriesParts = parent
    ? (index.childrenByParent.get(parent.series.id) ?? []).flatMap((m) => {
        const part = index.workById.get(m.child_id);
        return part ? [{ ...index.ref(part), position: m.position, isCurrent: part.id === row.id }] : [];
      })
    : [];

  const genreSlugs = new Set(work.genres.map((g) => g.slug));
  const similar = index
    .leafWorks()
    .filter((w) => w.id !== row.id && (index.genresByWork.get(w.id) ?? []).some((g) => genreSlugs.has(g.slug)))
    .sort(byNewest)
    .slice(0, 3)
    .map(index.summary);

  return {
    ...work,
    excerpt: row.excerpt_hi,
    seriesParts,
    similar,
  };
}

/** Works marked featured (any kind) for the home carousel, newest first. */
export async function getFeaturedWorks(
  locale: Locale = defaultLocale,
): Promise<Array<WorkSummary | BookSummary>> {
  const index = getIndex(await loadStore(), locale);
  return index.store.works
    .filter((w) => w.featured)
    .sort(byNewest)
    .map((w) => (isLeafKind(w.kind) ? index.summary(w) : index.bookSummary(w)));
}

/** Newest catalog works for the home page. */
export async function getLatestWorks(limit: number, locale: Locale = defaultLocale): Promise<WorkSummary[]> {
  const index = getIndex(await loadStore(), locale);
  return index.leafWorks().sort(byNewest).slice(0, limit).map(index.summary);
}
