import type { Tables } from "@/lib/database.types";
import type { Locale } from "@/lib/i18n/config";
import type { Store } from "./store";
import {
  BOOK_KINDS,
  LEAF_KINDS,
  type BookKind,
  type BookRef,
  type BookSummary,
  type Genre,
  type LeafKind,
  type Platform,
  type Release,
  type ReleaseFormat,
  type ReleaseVerb,
  type SeriesPlacement,
  type WorkKind,
  type WorkRef,
  type WorkSummary,
} from "./types";

type WorkRow = Tables<"works">;

/** Translatable column: `_hi` until English is enabled, then `_en` falling back to `_hi`. */
export function pick<T extends string | null>(hi: T, en: string | null, locale: Locale): T | string {
  return locale === "en" && en ? en : hi;
}

export const isLeafKind = (kind: WorkKind): kind is LeafKind =>
  (LEAF_KINDS as readonly WorkKind[]).includes(kind);
export const isBookKind = (kind: WorkKind): kind is BookKind =>
  (BOOK_KINDS as readonly WorkKind[]).includes(kind);

const VERBS: Record<ReleaseFormat, ReleaseVerb> = {
  online: "read",
  audiobook: "listen",
  print: "buy",
  ebook: "buy",
};
const FORMAT_ORDER: ReleaseFormat[] = ["online", "audiobook", "print", "ebook"];

export type Index = ReturnType<typeof buildIndex>;

const cache = new WeakMap<Store, Map<Locale, Index>>();

/** Lookup tables and mappers over one store, memoised per store and locale. */
export function getIndex(store: Store, locale: Locale): Index {
  let byLocale = cache.get(store);
  if (!byLocale) cache.set(store, (byLocale = new Map()));
  let index = byLocale.get(locale);
  if (!index) byLocale.set(locale, (index = buildIndex(store, locale)));
  return index;
}

function buildIndex(store: Store, locale: Locale) {
  const workById = new Map(store.works.map((w) => [w.id, w]));
  const workBySlug = new Map(store.works.map((w) => [w.slug, w]));

  // store.platforms is already ordered by sort_order.
  const platformById = new Map<string, Platform>(
    store.platforms.map((p) => [
      p.id,
      {
        slug: p.slug,
        name: pick(p.name_hi, p.name_en, locale),
        logoPath: p.logo_path,
        profileUrl: p.profile_url,
        description: p.description_hi === null ? null : pick(p.description_hi, p.description_en, locale),
      },
    ]),
  );
  const platformOrder = new Map(store.platforms.map((p) => [p.id, p.sort_order]));

  const genreById = new Map<string, Genre>(
    store.genres.map((g) => [g.id, { slug: g.slug, name: pick(g.name_hi, g.name_en, locale) }]),
  );

  const genresByWork = new Map<string, Genre[]>();
  for (const wg of store.workGenres) {
    const genre = genreById.get(wg.genre_id);
    if (!genre || !workById.has(wg.work_id)) continue;
    const list = genresByWork.get(wg.work_id) ?? [];
    list.push(genre);
    genresByWork.set(wg.work_id, list);
  }

  // Only memberships where both sides are visible (RLS already ensures this).
  const members = store.members.filter((m) => workById.has(m.parent_id) && workById.has(m.child_id));
  const childrenByParent = new Map<string, typeof members>();
  const parentsByChild = new Map<string, typeof members>();
  for (const m of members) {
    childrenByParent.set(m.parent_id, [...(childrenByParent.get(m.parent_id) ?? []), m]);
    parentsByChild.set(m.child_id, [...(parentsByChild.get(m.child_id) ?? []), m]);
  }
  for (const list of childrenByParent.values()) list.sort((a, b) => a.position - b.position);

  const ref = (w: WorkRow): WorkRef => ({
    slug: w.slug,
    kind: w.kind,
    // Works are Hindi-only on every language version (CLAUDE.md): never use _en.
    title: w.title_hi,
  });

  const bookRef = (w: WorkRow): BookRef => ({
    ...ref(w),
    editor: w.editor,
    contributorsTotal: w.contributors_total,
  });

  const toRelease = (r: Tables<"releases">, inheritedFrom: WorkRef | null): Release | null => {
    const platform = platformById.get(r.platform_id);
    if (!platform) return null;
    return {
      id: r.id,
      format: r.format,
      verb: VERBS[r.format],
      platform,
      url: r.url,
      releasedOn: r.released_on,
      narrator: r.narrator,
      publisher: r.publisher,
      isbn: r.isbn,
      chapterCount: r.chapter_count,
      inheritedFrom,
    };
  };

  const ownReleasesByWork = new Map<string, Tables<"releases">[]>();
  for (const r of store.releases) {
    if (!workById.has(r.work_id)) continue;
    ownReleasesByWork.set(r.work_id, [...(ownReleasesByWork.get(r.work_id) ?? []), r]);
  }

  const releaseRows = new Map(store.releases.map((r) => [r.id, r]));
  const sortReleases = (list: Release[]) =>
    list.sort(
      (a, b) =>
        FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format) ||
        (platformOrder.get(releaseRows.get(a.id)?.platform_id ?? "") ?? 0) -
          (platformOrder.get(releaseRows.get(b.id)?.platform_id ?? "") ?? 0),
    );

  const parentSeries = (w: WorkRow): { series: WorkRow; position: number } | null => {
    for (const m of parentsByChild.get(w.id) ?? []) {
      const parent = workById.get(m.parent_id);
      if (parent?.kind === "series") return { series: parent, position: m.position };
    }
    return null;
  };

  /** Own releases, plus a parent series' releases for leaf works. */
  const releasesOf = (w: WorkRow): Release[] => {
    const own = (ownReleasesByWork.get(w.id) ?? []).map((r) => toRelease(r, null));
    const parent = isLeafKind(w.kind) ? parentSeries(w) : null;
    const inherited = parent
      ? (ownReleasesByWork.get(parent.series.id) ?? []).map((r) => toRelease(r, ref(parent.series)))
      : [];
    return sortReleases([...own, ...inherited].filter((r): r is Release => r !== null));
  };

  const seriesPlacementOf = (w: WorkRow): SeriesPlacement | null => {
    const parent = parentSeries(w);
    if (!parent) return null;
    return {
      series: ref(parent.series),
      position: parent.position,
      totalParts: childrenByParent.get(parent.series.id)?.length ?? 0,
    };
  };

  const appearsInOf = (w: WorkRow): BookRef[] =>
    (parentsByChild.get(w.id) ?? [])
      .map((m) => workById.get(m.parent_id))
      .filter((p): p is WorkRow => !!p && (p.kind === "collection" || p.kind === "anthology"))
      .map(bookRef);

  const summary = (w: WorkRow): WorkSummary => ({
    ...ref(w),
    synopsis: w.synopsis_hi,
    publishedOn: w.published_on,
    coverPath: w.cover_path,
    featured: w.featured,
    genres: genresByWork.get(w.id) ?? [],
    releases: releasesOf(w),
    series: seriesPlacementOf(w),
    appearsIn: appearsInOf(w),
  });

  const bookSummary = (w: WorkRow): BookSummary => {
    const releases = releasesOf(w);
    const main =
      w.kind === "series"
        ? releases.find((r) => r.format === "audiobook") ?? releases[0]
        : releases.find((r) => r.format === "print") ?? releases.find((r) => r.format === "ebook") ?? releases[0];
    return {
      ...bookRef(w),
      synopsis: w.synopsis_hi,
      publishedOn: w.published_on,
      coverPath: w.cover_path,
      featured: w.featured,
      genres: genresByWork.get(w.id) ?? [],
      releases,
      mainRelease: main ?? null,
      partsCount: childrenByParent.get(w.id)?.length ?? 0,
      contentKinds: [
        ...new Set(
          (childrenByParent.get(w.id) ?? []).flatMap((m) => {
            const child = workById.get(m.child_id);
            return child ? [child.kind] : [];
          }),
        ),
      ],
    };
  };

  return {
    store,
    locale,
    workById,
    workBySlug,
    genresByWork,
    childrenByParent,
    parentSeries,
    ref,
    summary,
    bookSummary,
    leafWorks: () => store.works.filter((w) => isLeafKind(w.kind)),
    platforms: () => [...platformById.values()],
    genres: () => [...genreById.values()],
  };
}

/** Newest first; works without a date go last. */
export const byNewest = (a: { published_on: string | null }, b: { published_on: string | null }) =>
  (b.published_on ?? "").localeCompare(a.published_on ?? "");
