import type { ReleaseFormat, WorkKind } from "@/lib/data/types";
import { ALL_KINDS, allowedChildKinds, isParentKind } from "./works";
import { SLUG_PATTERN } from "./slug";

// What the work form sends to the server, and the rules it must follow
// (docs/Data.md "Rules"). The server runs validateWork(); the form shows the
// errors next to the fields (keys like "title", "releases.1.url").

export const RELEASE_FORMATS = ["online", "audiobook", "print", "ebook"] as const satisfies readonly ReleaseFormat[];

export type ReleaseInput = {
  /** Existing release id, or null for a new one. */
  id: string | null;
  format: ReleaseFormat;
  platformId: string;
  url: string;
  releasedOn: string;
  chapterCount: string;
  narrator: string;
  publisher: string;
  isbn: string;
};

export type WorkInput = {
  id: string | null;
  kind: WorkKind;
  status: "draft" | "published";
  title: string;
  slug: string;
  publishedOn: string;
  featured: boolean;
  synopsis: string;
  excerpt: string;
  coverPath: string | null;
  genreIds: string[];
  editor: string;
  featuredContributors: string[];
  contributorsTotal: string;
  releases: ReleaseInput[];
  /** Child work ids in order (series, collection, anthology only). */
  memberIds: string[];
};

export type ErrorCode =
  | "required"
  | "invalidSlug"
  | "slugTaken"
  | "invalidUrl"
  | "invalidNumber"
  | "invalidDate"
  | "contributorsTotalTooSmall"
  | "kindLocked"
  | "kindInParent"
  | "invalidMember"
  | "invalidPlatform";

export type FieldErrors = Record<string, ErrorCode>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\/\S+$/;

export const isValidDate = (value: string) => DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
export const isPositiveInt = (value: string) => /^\d+$/.test(value.trim()) && Number(value) > 0;

/**
 * Checks the form against the rules. The caller looks up the context: the kind
 * of every member id, the known platforms, and the kinds of the works this one
 * already belongs to.
 */
export function validateWork(
  input: WorkInput,
  context: { childKinds: Map<string, WorkKind>; platformIds: Set<string>; parentKinds: WorkKind[] },
): FieldErrors {
  const errors: FieldErrors = {};
  if (!ALL_KINDS.includes(input.kind as (typeof ALL_KINDS)[number])) errors.kind = "required";
  if (!input.title.trim()) errors.title = "required";
  if (!input.slug.trim()) errors.slug = "required";
  else if (!SLUG_PATTERN.test(input.slug)) errors.slug = "invalidSlug";
  if (input.publishedOn && !isValidDate(input.publishedOn)) errors.publishedOn = "invalidDate";
  if (input.coverPath && !input.coverPath.startsWith("covers/")) errors.coverPath = "required";

  // A work with parts/contents must stay a kind that can hold them, and a part
  // must stay a kind its series/book allows.
  if (!isParentKind(input.kind) && input.memberIds.length > 0) errors.kind = "kindLocked";
  else if (context.parentKinds.some((parent) => !allowedChildKinds(parent).includes(input.kind))) errors.kind = "kindInParent";

  if (input.kind === "anthology") {
    const featured = input.featuredContributors.map((s) => s.trim()).filter(Boolean);
    if (input.contributorsTotal.trim()) {
      if (!isPositiveInt(input.contributorsTotal)) errors.contributorsTotal = "invalidNumber";
      else if (Number(input.contributorsTotal) < 1 + featured.length) errors.contributorsTotal = "contributorsTotalTooSmall";
    }
  }

  input.releases.forEach((r, i) => {
    if (!RELEASE_FORMATS.includes(r.format)) errors[`releases.${i}.format`] = "required";
    if (!r.platformId) errors[`releases.${i}.platformId`] = "required";
    else if (!context.platformIds.has(r.platformId)) errors[`releases.${i}.platformId`] = "invalidPlatform";
    if (!r.url.trim()) errors[`releases.${i}.url`] = "required";
    else if (!URL_PATTERN.test(r.url.trim())) errors[`releases.${i}.url`] = "invalidUrl";
    if (r.releasedOn && !isValidDate(r.releasedOn)) errors[`releases.${i}.releasedOn`] = "invalidDate";
    if (r.format === "online" && r.chapterCount.trim() && !isPositiveInt(r.chapterCount)) errors[`releases.${i}.chapterCount`] = "invalidNumber";
  });

  const allowed = allowedChildKinds(input.kind);
  input.memberIds.forEach((childId, i) => {
    const kind = context.childKinds.get(childId);
    if (!kind || childId === input.id || !allowed.includes(kind) || input.memberIds.indexOf(childId) !== i) {
      errors[`members.${i}`] = "invalidMember";
    }
  });
  return errors;
}

const orNull = (value: string) => (value.trim() ? value.trim() : null);

/** Database row for works (insert/update), with fields cleared that don't apply to the kind. */
export function workRow(input: WorkInput) {
  const anthology = input.kind === "anthology";
  return {
    kind: input.kind,
    status: input.status,
    title_hi: input.title.trim(),
    slug: input.slug.trim(),
    published_on: orNull(input.publishedOn),
    featured: input.featured,
    synopsis_hi: orNull(input.synopsis),
    excerpt_hi: orNull(input.excerpt),
    cover_path: input.coverPath,
    editor: anthology ? orNull(input.editor) : null,
    featured_contributors: anthology ? input.featuredContributors.map((s) => s.trim()).filter(Boolean).slice(0, 3) : [],
    contributors_total: anthology && input.contributorsTotal.trim() ? Number(input.contributorsTotal) : null,
  };
}

/** Database row for a release, keeping only the fields its format uses. */
export function releaseRow(r: ReleaseInput, workId: string) {
  return {
    work_id: workId,
    format: r.format,
    platform_id: r.platformId,
    url: r.url.trim(),
    released_on: orNull(r.releasedOn),
    chapter_count: r.format === "online" && r.chapterCount.trim() ? Number(r.chapterCount) : null,
    narrator: r.format === "audiobook" ? orNull(r.narrator) : null,
    publisher: r.format === "print" || r.format === "ebook" ? orNull(r.publisher) : null,
    isbn: r.format === "print" ? orNull(r.isbn) : null,
  };
}
