"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { releaseRow, validateWork, workRow, type FieldErrors, type WorkInput } from "@/lib/admin/work-input";
import { isParentKind } from "@/lib/admin/works";
import { WORKS_TAG } from "@/lib/data/store";
import type { WorkKind } from "@/lib/data/types";
import { createServerClient } from "@/lib/supabase/server";

export type SaveWorkResult =
  | { ok: true; id: string }
  | { ok: false; errors: FieldErrors; message?: string };

/**
 * Saves a work with its genres, releases and members, step by step (decided:
 * no database transaction for now). If a later step fails, the message says
 * which part didn't save; saving again finishes it. Refreshes public pages.
 */
export async function saveWork(input: WorkInput): Promise<SaveWorkResult> {
  await requireAdmin();
  const db = await createServerClient();

  // Context for the rules: kinds of the chosen members, known platforms,
  // whether this work already has children, and slug uniqueness.
  const [children, platforms, existingChildren, slugOwner, parents] = await Promise.all([
    input.memberIds.length ? db.from("works").select("id, kind").in("id", input.memberIds) : Promise.resolve({ data: [], error: null }),
    db.from("platforms").select("id"),
    input.id ? db.from("work_members").select("child_id").eq("parent_id", input.id) : Promise.resolve({ data: [], error: null }),
    db.from("works").select("id").eq("slug", input.slug.trim()).maybeSingle(),
    input.id
      ? db.from("work_members").select("parent:works!work_members_parent_id_fkey(kind)").eq("child_id", input.id)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const loadError = children.error ?? platforms.error ?? existingChildren.error ?? slugOwner.error ?? parents.error;
  if (loadError) return { ok: false, errors: {}, message: loadError.message };

  const errors = validateWork(input, {
    childKinds: new Map((children.data ?? []).map((c: { id: string; kind: WorkKind }) => [c.id, c.kind])),
    platformIds: new Set((platforms.data ?? []).map((p) => p.id)),
    parentKinds: (parents.data ?? []).flatMap((p: { parent: { kind: WorkKind } | null }) => (p.parent ? [p.parent.kind] : [])),
  });
  if (slugOwner.data && slugOwner.data.id !== input.id) errors.slug = "slugTaken";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // 1. The work itself.
  let id = input.id;
  if (id) {
    const { error } = await db.from("works").update(workRow(input)).eq("id", id);
    if (error) return failed(error.message, "details");
  } else {
    const { data, error } = await db.from("works").insert(workRow(input)).select("id").single();
    if (error || !data) return failed(error?.message ?? "no id returned", "details");
    id = data.id;
  }

  // 2. Genres: replace the set.
  {
    const { error } = await db.from("work_genres").delete().eq("work_id", id);
    if (error) return failed(error.message, "genres", id);
    if (input.genreIds.length) {
      const { error: insertError } = await db.from("work_genres").insert(input.genreIds.map((genre_id) => ({ work_id: id!, genre_id })));
      if (insertError) return failed(insertError.message, "genres", id);
    }
  }

  // 3. Releases: update kept ones, insert new ones, delete removed ones.
  {
    const { data: current, error } = await db.from("releases").select("id").eq("work_id", id);
    if (error) return failed(error.message, "releases", id);
    const keep = new Set(input.releases.map((r) => r.id).filter(Boolean));
    const removed = (current ?? []).map((r) => r.id).filter((rid) => !keep.has(rid));
    if (removed.length) {
      const { error: deleteError } = await db.from("releases").delete().in("id", removed);
      if (deleteError) return failed(deleteError.message, "releases", id);
    }
    for (const r of input.releases) {
      const row = releaseRow(r, id);
      const { error: writeError } = r.id
        ? await db.from("releases").update(row).eq("id", r.id).eq("work_id", id)
        : await db.from("releases").insert(row);
      if (writeError) return failed(writeError.message, "releases", id);
    }
  }

  // 4. Members (parents only): replace the ordered list.
  if (isParentKind(input.kind) || (existingChildren.data ?? []).length > 0) {
    const { error } = await db.from("work_members").delete().eq("parent_id", id);
    if (error) return failed(error.message, "members", id);
    if (isParentKind(input.kind) && input.memberIds.length) {
      const { error: insertError } = await db
        .from("work_members")
        .insert(input.memberIds.map((child_id, position) => ({ parent_id: id!, child_id, position })));
      if (insertError) return failed(insertError.message, "members", id);
    }
  }

  updateTag(WORKS_TAG);
  return { ok: true, id };
}

function failed(reason: string, step: "details" | "genres" | "releases" | "members", id?: string): SaveWorkResult {
  // Something before this step may already be saved: refresh the public pages anyway.
  if (id) updateTag(WORKS_TAG);
  return { ok: false, errors: {}, message: `${step}: ${reason}` };
}

export async function deleteWork(id: string): Promise<{ ok: false; message: string } | never> {
  await requireAdmin();
  const db = await createServerClient();
  const { error } = await db.from("works").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  updateTag(WORKS_TAG);
  redirect("/admin/works");
}
