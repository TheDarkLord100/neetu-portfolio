"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { clean, isSlug, isUrl, orNull, type ActionResult, type Errors } from "@/lib/admin/validate";
import { SITE_TAG } from "@/lib/data/site";
import { WORKS_TAG } from "@/lib/data/store";
import { createServerClient } from "@/lib/supabase/server";

// Platforms and genres feed both the works data (release buttons, filters)
// and the site data (About page, footer), so saves refresh both.
function refresh() {
  updateTag(WORKS_TAG);
  updateTag(SITE_TAG);
}

export type PlatformInput = {
  id: string | null;
  nameHi: string;
  nameEn: string;
  slug: string;
  profileUrl: string;
  descriptionHi: string;
  descriptionEn: string;
  logoPath: string | null;
};
type PlatformField = "nameHi" | "slug" | "profileUrl";

export async function savePlatform(input: PlatformInput): Promise<ActionResult<PlatformField>> {
  await requireAdmin();
  const errors: Errors<PlatformField> = {};
  if (!clean(input.nameHi)) errors.nameHi = "required";
  if (!clean(input.slug)) errors.slug = "required";
  else if (!isSlug(clean(input.slug))) errors.slug = "invalidSlug";
  if (clean(input.profileUrl) && !isUrl(clean(input.profileUrl))) errors.profileUrl = "invalidUrl";

  const db = await createServerClient();
  const { data: owner } = await db.from("platforms").select("id").eq("slug", clean(input.slug)).maybeSingle();
  if (owner && owner.id !== input.id) errors.slug = "slugTaken";
  if (Object.keys(errors).length) return { ok: false, errors };

  const row = {
    name_hi: clean(input.nameHi),
    name_en: orNull(input.nameEn),
    slug: clean(input.slug),
    profile_url: orNull(input.profileUrl),
    description_hi: orNull(input.descriptionHi),
    description_en: orNull(input.descriptionEn),
    logo_path: input.logoPath?.startsWith("platforms/") ? input.logoPath : null,
  };
  if (input.id) {
    const { error } = await db.from("platforms").update(row).eq("id", input.id);
    if (error) return { ok: false, message: error.message };
    refresh();
    return { ok: true, id: input.id };
  }
  const { data: last } = await db.from("platforms").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await db
    .from("platforms")
    .insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  refresh();
  return { ok: true, id: data.id };
}

export async function deletePlatform(id: string): Promise<ActionResult> {
  await requireAdmin();
  const db = await createServerClient();
  const { count } = await db.from("releases").select("id", { count: "exact", head: true }).eq("platform_id", id);
  if (count) return { ok: false, message: `in use by ${count} releases` };
  const { error } = await db.from("platforms").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  refresh();
  return { ok: true };
}

/** Saves the platforms' order (ids in the new order). */
export async function reorderPlatforms(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  const db = await createServerClient();
  for (const [i, id] of ids.entries()) {
    const { error } = await db.from("platforms").update({ sort_order: i + 1 }).eq("id", id);
    if (error) return { ok: false, message: error.message };
  }
  refresh();
  return { ok: true };
}

export type GenreInput = { id: string | null; nameHi: string; nameEn: string; slug: string };
type GenreField = "nameHi" | "slug";

export async function saveGenre(input: GenreInput): Promise<ActionResult<GenreField>> {
  await requireAdmin();
  const errors: Errors<GenreField> = {};
  if (!clean(input.nameHi)) errors.nameHi = "required";
  if (!clean(input.slug)) errors.slug = "required";
  else if (!isSlug(clean(input.slug))) errors.slug = "invalidSlug";
  const db = await createServerClient();
  const { data: owner } = await db.from("genres").select("id").eq("slug", clean(input.slug)).maybeSingle();
  if (owner && owner.id !== input.id) errors.slug = "slugTaken";
  if (Object.keys(errors).length) return { ok: false, errors };

  const row = { name_hi: clean(input.nameHi), name_en: orNull(input.nameEn), slug: clean(input.slug) };
  const { data, error } = input.id
    ? await db.from("genres").update(row).eq("id", input.id).select("id").single()
    : await db.from("genres").insert(row).select("id").single();
  if (error) return { ok: false, message: error.message };
  refresh();
  return { ok: true, id: data.id };
}

export async function deleteGenre(id: string): Promise<ActionResult> {
  await requireAdmin();
  const db = await createServerClient();
  const { error } = await db.from("genres").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  refresh();
  return { ok: true };
}
