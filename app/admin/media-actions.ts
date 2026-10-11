"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { IMAGES_BUCKET } from "@/lib/data/images";
import { createServerClient } from "@/lib/supabase/server";

const FOLDERS = ["covers/", "author/", "platforms/"];

export type DeleteMediaResult = { ok: true } | { ok: false; inUse: string[] } | { ok: false; error: string };

// Deletes one image from storage, unless a work, the profile or a platform
// still points at it (the library lets images be reused, so nothing is
// deleted automatically).
export async function deleteMedia(path: string): Promise<DeleteMediaResult> {
  await requireAdmin();
  if (!FOLDERS.some((f) => path.startsWith(f)) || path.includes("..")) return { ok: false, error: "Not an image path." };

  const db = await createServerClient();
  const [works, profile, platforms] = await Promise.all([
    db.from("works").select("title_hi").eq("cover_path", path),
    db.from("author_profile").select("id").eq("photo_path", path),
    db.from("platforms").select("name_hi").eq("logo_path", path),
  ]);
  const inUse = [
    ...(works.data ?? []).map((w) => w.title_hi),
    ...((profile.data ?? []).length ? ["Author profile"] : []),
    ...(platforms.data ?? []).map((p) => p.name_hi),
  ];
  if (inUse.length > 0) return { ok: false, inUse };

  const { error } = await db.storage.from(IMAGES_BUCKET).remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
