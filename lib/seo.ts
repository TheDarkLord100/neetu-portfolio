import type { Metadata } from "next";
import type { AuthorProfile, Awards } from "@/lib/data/site";
import type { BookDetail, Platform, Release, WorkDetail } from "@/lib/data/types";
import { imageUrl } from "@/lib/data/images";
import { env } from "@/lib/env";
import { defaultLocale, enabledLocales, type Locale } from "@/lib/i18n/config";
import { localize, routes } from "@/lib/routes";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

// Search and link-preview data: canonical + language alternates, Open Graph,
// and schema.org JSON-LD. Paths passed in are unprefixed ("/work/x").

const OG_LOCALE: Record<Locale, string> = { hi: "hi_IN", en: "en_IN" };

/** "बारिश की रात" → "बारिश की रात — नीतू सिंह" (the page title template, for previews). */
export const fullTitle = (m: { meta: { titleTemplate: string } }, title: string) => m.meta.titleTemplate.replace("%s", title);

export const absoluteUrl = (path: string) => new URL(path, env.siteUrl).toString();

/** Canonical address for this language, plus every language version (Hindi is x-default). */
export function alternates(path: string, locale: Locale): Metadata["alternates"] {
  return {
    canonical: localize(path, locale),
    languages: {
      ...Object.fromEntries(enabledLocales.map((l) => [l, localize(path, l)])),
      "x-default": localize(path, defaultLocale),
    },
  };
}

type PageSeo = {
  path: string;
  locale: Locale;
  /** Full title as shown in previews ("बारिश की रात — नीतू सिंह"). */
  title: string;
  description?: string | null;
  /** Storage path of a cover or photo. */
  imagePath?: string | null;
  type?: "website" | "article" | "book" | "profile";
};

/** alternates + openGraph + twitter for one page. */
export function pageSeo({ path, locale, title, description, imagePath, type = "website" }: PageSeo): Metadata {
  const images = imagePath ? [{ url: imageUrl(imagePath) }] : undefined;
  return {
    alternates: alternates(path, locale),
    openGraph: {
      type,
      url: localize(path, locale),
      title,
      description: description ?? undefined,
      siteName: title.split(" — ").at(-1),
      locale: OG_LOCALE[locale],
      alternateLocale: enabledLocales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title, description: description ?? undefined, images: images?.map((i) => i.url) },
  };
}

// ---------------------------------------------------------------- JSON-LD

const PERSON_ID = () => absoluteUrl("/#person");

type Names = { name: string; alternateName: string };

/** The author: home and About pages. */
export function personJsonLd({
  names,
  locale,
  profile,
  platforms,
  awards,
}: {
  names: Names;
  locale: Locale;
  profile: AuthorProfile | null;
  platforms: Platform[];
  awards: Awards;
}) {
  const sameAs = [...platforms.map((p) => p.profileUrl), ...(profile?.socialLinks.map((s) => s.url) ?? [])].filter(Boolean);
  const awardTitles = [...awards.featured, ...awards.byYear.flatMap((g) => g.awards)].map((a) => (a.year ? `${a.title} (${a.year})` : a.title));
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID(),
    name: names.name,
    alternateName: names.alternateName,
    url: absoluteUrl(localize(routes.about, locale)),
    image: profile?.photoPath ? imageUrl(profile.photoPath) : undefined,
    jobTitle: profile?.tagline ?? undefined,
    description: profile?.intro ?? undefined,
    knowsLanguage: "hi",
    sameAs: sameAs.length ? sameAs : undefined,
    award: awardTitles.length ? awardTitles : undefined,
  };
}

const author = (names: Names) => ({ "@type": "Person", "@id": PERSON_ID(), name: names.name });

const FORMAT: Partial<Record<Release["format"], string>> = {
  print: "https://schema.org/Paperback",
  ebook: "https://schema.org/EBook",
  audiobook: "https://schema.org/AudiobookFormat",
};

/** Printed, ebook and audiobook editions of a work or book. */
function editions(releases: Release[], name: string, names: Names) {
  const list = releases
    .filter((r) => FORMAT[r.format] && !r.inheritedFrom)
    .map((r) => ({
      "@type": r.format === "audiobook" ? "Audiobook" : "Book",
      name,
      bookFormat: FORMAT[r.format],
      url: r.url,
      isbn: r.isbn ?? undefined,
      publisher: r.publisher ? { "@type": "Organization", name: r.publisher } : { "@type": "Organization", name: r.platform.name },
      readBy: r.narrator ? { "@type": "Person", name: r.narrator } : undefined,
      datePublished: r.releasedOn ?? undefined,
      inLanguage: "hi",
      author: author(names),
    }));
  return list.length ? list : undefined;
}

/** A story, poem or novel (novels and works with a book edition are a Book). */
export function workJsonLd(work: WorkDetail, path: string, names: Names) {
  const isBook = work.kind === "novel" || work.releases.some((r) => r.format === "print" || r.format === "ebook");
  return {
    "@context": "https://schema.org",
    "@type": isBook ? "Book" : "CreativeWork",
    name: work.title,
    url: absoluteUrl(path),
    inLanguage: "hi",
    author: author(names),
    description: work.synopsis ?? undefined,
    datePublished: work.publishedOn ?? undefined,
    genre: work.genres.length ? work.genres.map((g) => g.name) : undefined,
    image: work.coverPath ? imageUrl(work.coverPath) : undefined,
    isPartOf: work.series ? { "@type": "BookSeries", name: work.series.series.title, url: absoluteUrl(routes.book(work.series.series.slug)) } : undefined,
    workExample: editions(work.releases, work.title, names),
  };
}

/** A series, collection or anthology. */
export function bookJsonLd(book: BookDetail, path: string, names: Names) {
  const isSeries = book.kind === "series";
  return {
    "@context": "https://schema.org",
    "@type": isSeries ? "BookSeries" : "Book",
    name: book.title,
    url: absoluteUrl(path),
    inLanguage: "hi",
    author: author(names),
    editor: book.editor ? { "@type": "Person", name: book.editor } : undefined,
    contributor: book.featuredContributors.length ? book.featuredContributors.map((name) => ({ "@type": "Person", name })) : undefined,
    description: book.synopsis ?? undefined,
    datePublished: book.publishedOn ?? undefined,
    genre: book.genres.length ? book.genres.map((g) => g.name) : undefined,
    image: book.coverPath ? imageUrl(book.coverPath) : undefined,
    hasPart: book.contents.length
      ? book.contents.map((c) => ({ "@type": "CreativeWork", name: c.work.title, url: absoluteUrl(routes.work(c.work.slug)) }))
      : undefined,
    workExample: editions(book.releases, book.title, names),
  };
}

/** Names in the page language first, the other script as the alternate. */
export function authorNames(locale: Locale): Names {
  return locale === "en" ? { name: en.site.name, alternateName: hi.site.name } : { name: hi.site.name, alternateName: en.site.name };
}
