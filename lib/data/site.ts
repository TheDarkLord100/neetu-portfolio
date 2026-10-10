import { cacheLife, cacheTag } from "next/cache";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { createPublicClient } from "@/lib/supabase/public";
import { getIndex, pick } from "./map";
import { loadStore } from "./store";
import type { Genre, Platform } from "./types";

export const SITE_TAG = "site";

export type SocialLink = { name: string; url: string };

export type AuthorProfile = {
  tagline: string | null;
  intro: string | null;
  bio: string | null;
  quote: string | null;
  photoPath: string | null;
  email: string | null;
  socialLinks: SocialLink[];
};

export type Award = { title: string; organiser: string | null; year: number | null };

export type Awards = {
  featured: Award[];
  /** Non-featured awards grouped by year, newest year first. */
  byYear: Array<{ year: number | null; awards: Award[] }>;
  otherCount: number;
};

async function loadSite() {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("days");

  const db = createPublicClient();
  // RLS limits awards to visible ones; the filter is a second guard.
  const [profile, awards] = await Promise.all([
    db.from("author_profile").select("*").maybeSingle(),
    db.from("awards").select("*").eq("visible", true).order("sort_order").order("year", { ascending: false }),
  ]);
  if (profile.error) throw new Error(`Failed to load author_profile: ${profile.error.message}`);
  if (awards.error) throw new Error(`Failed to load awards: ${awards.error.message}`);
  return { profile: profile.data, awards: awards.data };
}

const opt = (hi: string | null, en: string | null, locale: Locale) => (hi === null ? null : pick(hi, en, locale));

function isSocialLink(value: unknown): value is SocialLink {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === "string" && typeof v.url === "string" && /^https?:\/\//.test(v.url);
}

export async function getAuthorProfile(locale: Locale = defaultLocale): Promise<AuthorProfile | null> {
  const { profile: p } = await loadSite();
  if (!p) return null;
  return {
    tagline: opt(p.tagline_hi, p.tagline_en, locale),
    intro: opt(p.intro_hi, p.intro_en, locale),
    bio: opt(p.bio_hi, p.bio_en, locale),
    quote: opt(p.quote_hi, p.quote_en, locale),
    photoPath: p.photo_path,
    email: p.email,
    socialLinks: Array.isArray(p.social_links) ? p.social_links.filter(isSocialLink) : [],
  };
}

export async function getAwards(locale: Locale = defaultLocale): Promise<Awards> {
  const { awards } = await loadSite();
  const toAward = (a: (typeof awards)[number]): Award => ({
    title: pick(a.title_hi, a.title_en, locale),
    organiser: opt(a.organiser_hi, a.organiser_en, locale),
    year: a.year,
  });

  const featured = awards.filter((a) => a.featured).map(toAward);
  const others = awards.filter((a) => !a.featured);
  const years = [...new Set(others.map((a) => a.year))].sort((a, b) => (b ?? 0) - (a ?? 0));

  return {
    featured,
    byYear: years.map((year) => ({ year, awards: others.filter((a) => a.year === year).map(toAward) })),
    otherCount: others.length,
  };
}

/** Platforms in display order (About page, footer, catalog filters). */
export async function getPlatforms(locale: Locale = defaultLocale): Promise<Platform[]> {
  return getIndex(await loadStore(), locale).platforms();
}

export async function getGenres(locale: Locale = defaultLocale): Promise<Genre[]> {
  return getIndex(await loadStore(), locale).genres();
}
