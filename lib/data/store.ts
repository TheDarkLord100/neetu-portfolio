import { cacheLife, cacheTag } from "next/cache";
import type { Tables } from "@/lib/database.types";
import { createPublicClient } from "@/lib/supabase/public";

// Loads every published work with its releases, genres and memberships in one
// cached pass. The catalog filters in memory (decided for this project size);
// revisit with a database view if this gets slow.

export const WORKS_TAG = "works";

export type Store = {
  works: Tables<"works">[];
  releases: Tables<"releases">[];
  platforms: Tables<"platforms">[];
  genres: Tables<"genres">[];
  workGenres: Tables<"work_genres">[];
  members: Tables<"work_members">[];
};

function unwrap<T>(label: string, result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Failed to load ${label}: ${result.error.message}`);
  return result.data ?? ([] as T);
}

export async function loadStore(): Promise<Store> {
  "use cache";
  cacheTag(WORKS_TAG);
  cacheLife("days");

  const db = createPublicClient();
  // RLS already limits these to published works; the status filter is a second guard.
  const [works, releases, platforms, genres, workGenres, members] = await Promise.all([
    db.from("works").select("*").eq("status", "published"),
    db.from("releases").select("*"),
    db.from("platforms").select("*").order("sort_order"),
    db.from("genres").select("*").order("name_hi"),
    db.from("work_genres").select("*"),
    db.from("work_members").select("*").order("position"),
  ]);

  return {
    works: unwrap("works", works),
    releases: unwrap("releases", releases),
    platforms: unwrap("platforms", platforms),
    genres: unwrap("genres", genres),
    workGenres: unwrap("work_genres", workGenres),
    members: unwrap("work_members", members),
  };
}
