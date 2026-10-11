import type { Enums } from "@/lib/database.types";

// Plain, serialisable shapes returned by lib/data. Text fields are already
// resolved to the requested locale (Hindi until English is enabled).

export type WorkKind = Enums<"work_kind">;
export type ReleaseFormat = Enums<"release_format">;

/** Kinds listed in the catalog. Series, collections and anthologies are "books". */
export const LEAF_KINDS = ["story", "poem", "novel"] as const satisfies readonly WorkKind[];
export type LeafKind = (typeof LEAF_KINDS)[number];

export const BOOK_KINDS = ["series", "collection", "anthology"] as const satisfies readonly WorkKind[];
export type BookKind = (typeof BOOK_KINDS)[number];

/** Action shown on a release button; the label comes from messages (पढ़ें / सुनें / खरीदें). */
export type ReleaseVerb = "read" | "listen" | "buy";

export type Platform = {
  slug: string;
  name: string;
  logoPath: string | null;
  profileUrl: string | null;
  description: string | null;
};

export type Genre = { slug: string; name: string };

/** Minimal link target for a work or book. */
export type WorkRef = { slug: string; kind: WorkKind; title: string };

export type Release = {
  id: string;
  format: ReleaseFormat;
  verb: ReleaseVerb;
  platform: Platform;
  url: string;
  releasedOn: string | null;
  narrator: string | null;
  publisher: string | null;
  isbn: string | null;
  chapterCount: number | null;
  /** Set when the release belongs to a parent series and is shown on its part. */
  inheritedFrom: WorkRef | null;
};

/** A work's place in its series. */
export type SeriesPlacement = { series: WorkRef; position: number; totalParts: number };

/** What lists (catalog rows, latest works, contents) need. */
export type WorkSummary = WorkRef & {
  synopsis: string | null;
  publishedOn: string | null;
  coverPath: string | null;
  featured: boolean;
  genres: Genre[];
  /** Own releases plus releases of a parent series (Data.md: effective releases). */
  releases: Release[];
  series: SeriesPlacement | null;
  /** Collections and anthologies containing this work. */
  appearsIn: BookRef[];
};

export type BookRef = WorkRef & {
  editor: string | null;
  contributorsTotal: number | null;
};

export type SeriesPart = WorkRef & { position: number; isCurrent: boolean };

export type WorkDetail = WorkSummary & {
  excerpt: string | null;
  /** All parts of the series in order, when this work is a series part. */
  seriesParts: SeriesPart[];
  /** Up to 3 works sharing a genre. */
  similar: WorkSummary[];
};

export type ContentsItem = { position: number; work: WorkSummary };

/** A book card: series, collection, anthology, or a single work with a print release. */
export type BookSummary = BookRef & {
  synopsis: string | null;
  publishedOn: string | null;
  coverPath: string | null;
  featured: boolean;
  genres: Genre[];
  releases: Release[];
  /** The release shown on book cards: print for books, audiobook for series. */
  /** The one button on book cards: buy (print, ebook) → read (a series: part 1) → listen. */
  mainRelease: Release | null;
  partsCount: number;
  /** Distinct kinds of the visible contents, e.g. ["poem"] for a poetry collection. */
  contentKinds: WorkKind[];
};

export type BookDetail = BookSummary & {
  contents: ContentsItem[];
  featuredContributors: string[];
  /** Authors besides her and the featured ones ("और N अन्य लेखक"). */
  otherContributorsCount: number;
};
