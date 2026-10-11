import type { BookKind } from "@/lib/data/types";

// Book page settings (DESIGN.md §7.5).

export const booksConfig = {
  /**
   * Whether a book page lists its contents (the works linked to it).
   * Collections and anthologies: off — the book's own description says what
   * it holds (e.g. "108 कविताओं का संग्रह"); the site doesn't list or count
   * the works inside. Series: on — readers need the parts to move between them.
   */
  showContents: { series: true, collection: false, anthology: false } satisfies Record<BookKind, boolean>,
} as const;
