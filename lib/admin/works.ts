import type { Store } from "@/lib/data/store";
import type { WorkKind } from "@/lib/data/types";
import { normalizeSearchText } from "@/lib/data/search";

// Shapes and helpers shared by the admin works list (server builds, client filters).

export const ALL_KINDS = ["story", "poem", "novel", "series", "collection", "anthology"] as const satisfies readonly WorkKind[];
/** Kinds that hold other works through work_members. */
export const PARENT_KINDS = ["series", "collection", "anthology"] as const satisfies readonly WorkKind[];
export const isParentKind = (kind: WorkKind) => (PARENT_KINDS as readonly WorkKind[]).includes(kind);

/** Which kinds a parent may contain (Data.md rules). */
export function allowedChildKinds(parent: WorkKind): readonly WorkKind[] {
  if (parent === "series") return ["novel"];
  if (parent === "collection" || parent === "anthology") return ["poem", "story"];
  return [];
}

export type AdminWorkRow = {
  id: string;
  slug: string;
  kind: WorkKind;
  status: "draft" | "published";
  title: string;
  coverPath: string | null;
  featured: boolean;
  publishedOn: string | null;
  updatedAt: string;
  releaseCount: number;
  parents: string[];
  /** Normalised title + slug for search. */
  search: string;
};

export function toAdminRows(store: Store): AdminWorkRow[] {
  const titleById = new Map(store.works.map((w) => [w.id, w.title_hi]));
  const releaseCount = new Map<string, number>();
  for (const r of store.releases) releaseCount.set(r.work_id, (releaseCount.get(r.work_id) ?? 0) + 1);
  const parents = new Map<string, string[]>();
  for (const m of store.members) {
    const title = titleById.get(m.parent_id);
    if (title) parents.set(m.child_id, [...(parents.get(m.child_id) ?? []), title]);
  }
  return store.works.map((w) => ({
    id: w.id,
    slug: w.slug,
    kind: w.kind,
    status: w.status,
    title: w.title_hi,
    coverPath: w.cover_path,
    featured: w.featured,
    publishedOn: w.published_on,
    updatedAt: w.updated_at,
    releaseCount: releaseCount.get(w.id) ?? 0,
    parents: parents.get(w.id) ?? [],
    search: normalizeSearchText(`${w.title_hi} ${w.slug.replace(/-/g, " ")} ${w.slug}`),
  }));
}

/** Public address of a work or book (for "View on site"). */
export function publicHref(kind: WorkKind, slug: string): string {
  return isParentKind(kind) ? `/book/${slug}` : `/work/${slug}`;
}
