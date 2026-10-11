"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { clean, orNull, type ActionResult, type Errors } from "@/lib/admin/validate";
import { SITE_TAG } from "@/lib/data/site";
import { createServerClient } from "@/lib/supabase/server";

export type AwardInput = {
  id: string | null;
  titleHi: string;
  titleEn: string;
  organiserHi: string;
  organiserEn: string;
  year: string;
  featured: boolean;
  visible: boolean;
};

export async function saveAward(input: AwardInput): Promise<ActionResult<"titleHi" | "year">> {
  await requireAdmin();
  const errors: Errors<"titleHi" | "year"> = {};
  if (!clean(input.titleHi)) errors.titleHi = "required";
  const year = clean(input.year);
  if (year && !(/^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= 2100)) errors.year = "invalidYear";
  if (Object.keys(errors).length) return { ok: false, errors };

  const db = await createServerClient();
  const row = {
    title_hi: clean(input.titleHi),
    title_en: orNull(input.titleEn),
    organiser_hi: orNull(input.organiserHi),
    organiser_en: orNull(input.organiserEn),
    year: year ? Number(year) : null,
    featured: input.featured,
    visible: input.visible,
  };

  // Newly featured awards go to the end of the featured order.
  let sortOrder: number | undefined;
  const { data: current } = input.id ? await db.from("awards").select("featured").eq("id", input.id).single() : { data: null };
  if (input.featured && !current?.featured) {
    const { data: last } = await db.from("awards").select("sort_order").eq("featured", true).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    sortOrder = (last?.sort_order ?? 0) + 1;
  }

  const { data, error } = input.id
    ? await db.from("awards").update({ ...row, ...(sortOrder !== undefined && { sort_order: sortOrder }) }).eq("id", input.id).select("id").single()
    : await db.from("awards").insert({ ...row, sort_order: sortOrder ?? 0 }).select("id").single();
  if (error) return { ok: false, message: error.message };
  updateTag(SITE_TAG);
  return { ok: true, id: data.id };
}

export async function setAwardVisible(id: string, visible: boolean): Promise<ActionResult> {
  await requireAdmin();
  const db = await createServerClient();
  const { error } = await db.from("awards").update({ visible }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  updateTag(SITE_TAG);
  return { ok: true };
}

export async function deleteAward(id: string): Promise<ActionResult> {
  await requireAdmin();
  const db = await createServerClient();
  const { error } = await db.from("awards").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  updateTag(SITE_TAG);
  return { ok: true };
}

/** Saves the order of the featured awards (ids in the new order). */
export async function reorderFeaturedAwards(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  const db = await createServerClient();
  for (const [i, id] of ids.entries()) {
    const { error } = await db.from("awards").update({ sort_order: i + 1 }).eq("id", id);
    if (error) return { ok: false, message: error.message };
  }
  updateTag(SITE_TAG);
  return { ok: true };
}
