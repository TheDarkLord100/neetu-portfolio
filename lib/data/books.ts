import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { byNewest, getIndex, isBookKind } from "./map";
import { loadStore } from "./store";
import type { BookDetail, BookSummary } from "./types";

export type BooksGroups = {
  /** Her own printed books: collections and single works with a print release. */
  own: BookSummary[];
  anthologies: BookSummary[];
  series: BookSummary[];
};

/** Everything on the पुस्तकें page, grouped, newest first. */
export async function getBooks(locale: Locale = defaultLocale): Promise<BooksGroups> {
  const index = getIndex(await loadStore(), locale);
  const works = [...index.store.works].sort(byNewest);
  const hasOwnPrint = (id: string) => index.store.releases.some((r) => r.work_id === id && r.format === "print");

  return {
    own: works
      .filter((w) => w.kind === "collection" || (!isBookKind(w.kind) && hasOwnPrint(w.id)))
      .map(index.bookSummary),
    anthologies: works.filter((w) => w.kind === "anthology").map(index.bookSummary),
    series: works.filter((w) => w.kind === "series").map(index.bookSummary),
  };
}

/** A series, collection or anthology for its book page; null if missing or not a book. */
export async function getBook(slug: string, locale: Locale = defaultLocale): Promise<BookDetail | null> {
  const index = getIndex(await loadStore(), locale);
  const row = index.workBySlug.get(slug);
  if (!row || !isBookKind(row.kind)) return null;

  const contents = (index.childrenByParent.get(row.id) ?? []).flatMap((m) => {
    const child = index.workById.get(m.child_id);
    return child ? [{ position: m.position, work: index.summary(child) }] : [];
  });

  const featuredContributors = row.featured_contributors ?? [];
  const otherContributorsCount =
    row.kind === "anthology" && row.contributors_total
      ? Math.max(0, row.contributors_total - 1 - featuredContributors.length)
      : 0;

  return {
    ...index.bookSummary(row),
    contents,
    featuredContributors,
    otherContributorsCount,
  };
}
