import type { BookSummary, WorkKind } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import { routesFor } from "@/lib/routes";

type M = Pick<Messages, "kinds" | "book" | "work">;

/** Kind label for a book; collections are named by their contents ("कविता संग्रह"). */
export function bookKindLabel(book: { kind: WorkKind; contentKinds?: WorkKind[] }, m: M): string {
  if (book.kind === "collection" && book.contentKinds?.length === 1) {
    if (book.contentKinds[0] === "poem") return m.kinds.collectionPoems;
    if (book.contentKinds[0] === "story") return m.kinds.collectionStories;
  }
  return m.kinds[book.kind];
}

/**
 * Detail line under a book card (DESIGN.md §7.4):
 * "कविता संग्रह, <publisher>, 2025", "साझा संकलन, नीतू सिंह और 27 अन्य लेखक, 2026",
 * "2 भाग, पूरा ऑडियोबुक भी".
 */
export function bookDetail(book: BookSummary, m: M): string {
  const sep = m.work.listSeparator;
  const kind = bookKindLabel(book, m);
  const year = (book.mainRelease?.releasedOn ?? book.publishedOn)?.slice(0, 4) ?? null;
  if (book.kind === "series") {
    const hasAudiobook = book.releases.some((r) => r.format === "audiobook");
    return [
      book.partsCount > 0 ? format(m.book.partsCount, { count: book.partsCount }) : kind,
      hasAudiobook ? m.book.withAudiobook : null,
    ]
      .filter(Boolean)
      .join(sep);
  }
  if (book.kind === "anthology") {
    const writers =
      book.contributorsTotal && book.contributorsTotal > 1
        ? format(m.book.contributors, { count: book.contributorsTotal - 1 })
        : null;
    return [kind, writers, year].filter(Boolean).join(sep);
  }
  return [kind, book.mainRelease?.publisher ?? null, year].filter(Boolean).join(sep);
}

/** Books (series, collection, anthology) have book pages; single printed works keep their work page. */
export function bookHref(book: { kind: WorkKind; slug: string }, locale: Locale): string {
  const routes = routesFor(locale);
  return book.kind === "series" || book.kind === "collection" || book.kind === "anthology"
    ? routes.book(book.slug)
    : routes.work(book.slug);
}
