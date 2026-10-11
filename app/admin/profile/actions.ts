"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { clean, isEmail, isUrl, orNull, type ActionResult, type Errors } from "@/lib/admin/validate";
import { SITE_TAG } from "@/lib/data/site";
import { createServerClient } from "@/lib/supabase/server";

export type ProfileInput = {
  taglineHi: string;
  taglineEn: string;
  introHi: string;
  introEn: string;
  bioHi: string;
  bioEn: string;
  quoteHi: string;
  quoteEn: string;
  photoPath: string | null;
  email: string;
  socialLinks: { name: string; url: string }[];
};

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  await requireAdmin();
  const errors: Errors<string> = {};
  if (clean(input.email) && !isEmail(clean(input.email))) errors.email = "invalidEmail";
  const links = input.socialLinks.map((l) => ({ name: clean(l.name), url: clean(l.url) })).filter((l) => l.name || l.url);
  links.forEach((l, i) => {
    if (!l.name) errors[`social.${i}.name`] = "required";
    if (!l.url) errors[`social.${i}.url`] = "required";
    else if (!isUrl(l.url)) errors[`social.${i}.url`] = "invalidUrl";
  });
  if (Object.keys(errors).length) return { ok: false, errors };

  const db = await createServerClient();
  const { error } = await db.from("author_profile").upsert({
    id: true,
    tagline_hi: orNull(input.taglineHi),
    tagline_en: orNull(input.taglineEn),
    intro_hi: orNull(input.introHi),
    intro_en: orNull(input.introEn),
    bio_hi: orNull(input.bioHi),
    bio_en: orNull(input.bioEn),
    quote_hi: orNull(input.quoteHi),
    quote_en: orNull(input.quoteEn),
    photo_path: input.photoPath?.startsWith("author/") ? input.photoPath : null,
    email: orNull(input.email),
    social_links: links,
  });
  if (error) return { ok: false, message: error.message };
  updateTag(SITE_TAG);
  return { ok: true };
}
