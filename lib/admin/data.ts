import type { Tables } from "@/lib/database.types";
import type { Store } from "@/lib/data/store";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";

// Admin reads (server only). They go through the admin's own session, so RLS
// shows drafts too; nothing here is cached. Each one checks admin access first.

function unwrap<T>(label: string, result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Failed to load ${label}: ${result.error.message}`);
  return result.data ?? ([] as T);
}

/** Everything about works, drafts included (same shape as the public store). */
export async function loadAdminStore(): Promise<Store> {
  await requireAdmin();
  const db = await createServerClient();
  const [works, releases, platforms, genres, workGenres, members] = await Promise.all([
    db.from("works").select("*").order("updated_at", { ascending: false }),
    db.from("releases").select("*"),
    db.from("platforms").select("*").order("sort_order").order("name_en"),
    db.from("genres").select("*").order("name_hi"),
    db.from("work_genres").select("*"),
    db.from("work_members").select("*").order("position"),
  ]);
  return {
    works: unwrap("works", works),
    releases: unwrap("releases", releases),
    platforms: unwrap("platforms", platforms),
    genres: unwrap("genres", genres),
    workGenres: unwrap("work genres", workGenres),
    members: unwrap("members", members),
  };
}

export type PlatformsAdminData = {
  platforms: Tables<"platforms">[];
  genres: Tables<"genres">[];
  /** Releases per platform id (a platform in use can't be deleted). */
  releaseCounts: Record<string, number>;
  /** Works per genre id. */
  workCounts: Record<string, number>;
};

export async function loadPlatformsAndGenres(): Promise<PlatformsAdminData> {
  await requireAdmin();
  const db = await createServerClient();
  const [platforms, genres, releases, workGenres] = await Promise.all([
    db.from("platforms").select("*").order("sort_order").order("name_en"),
    db.from("genres").select("*").order("name_hi"),
    db.from("releases").select("platform_id"),
    db.from("work_genres").select("genre_id"),
  ]);
  const count = (ids: string[]) => ids.reduce<Record<string, number>>((acc, id) => ((acc[id] = (acc[id] ?? 0) + 1), acc), {});
  return {
    platforms: unwrap("platforms", platforms),
    genres: unwrap("genres", genres),
    releaseCounts: count(unwrap("releases", releases).map((r) => r.platform_id)),
    workCounts: count(unwrap("work genres", workGenres).map((g) => g.genre_id)),
  };
}

export async function loadAuthorProfile(): Promise<Tables<"author_profile"> | null> {
  await requireAdmin();
  const db = await createServerClient();
  const { data, error } = await db.from("author_profile").select("*").maybeSingle();
  if (error) throw new Error(`Failed to load the author profile: ${error.message}`);
  return data;
}

export async function loadAwards(): Promise<Tables<"awards">[]> {
  await requireAdmin();
  const db = await createServerClient();
  return unwrap("awards", await db.from("awards").select("*").order("sort_order").order("year", { ascending: false }));
}
