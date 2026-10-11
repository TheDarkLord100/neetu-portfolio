import type { BookSummary, WorkKind } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { routes } from "@/lib/routes";

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
 * Detail line under a book card: "कविता संग्रह, <publisher>",
 * "साझा संकलन, नीतू सिंह और 27 अन्य लेखक", "धारावाहिक उपन्यास, 2 भाग".
 */
export function bookDetail(book: BookSummary, m: M): string {
  const kind = bookKindLabel(book, m);
  if (book.kind === "anthology" && book.contributorsTotal && book.contributorsTotal > 1) {
    return [kind, format(m.book.contributors, { count: book.contributorsTotal - 1 })].join(m.work.listSeparator);
  }
  if (book.kind === "series" && book.partsCount > 0) {
    return [kind, format(m.book.partsCount, { count: book.partsCount })].join(m.work.listSeparator);
  }
  const publisher = book.mainRelease?.publisher;
  return publisher ? format(m.book.detail, { kind, publisher }) : kind;
}

/** Books (series, collection, anthology) have book pages; single printed works keep their work page. */
export function bookHref(book: { kind: WorkKind; slug: string }): string {
  return book.kind === "series" || book.kind === "collection" || book.kind === "anthology"
    ? routes.book(book.slug)
    : routes.work(book.slug);
}
