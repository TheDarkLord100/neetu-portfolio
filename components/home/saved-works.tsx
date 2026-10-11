"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ClothCover } from "@/components/cover/cloth-cover";
import { BookmarkIcon } from "@/components/icons";
import { ActionPills } from "@/components/release/action-pills";
import type { Release, WorkKind } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { localeOf, routesFor } from "@/lib/routes";
import { useSavedWorks } from "@/lib/saved";

/** Compact work data the browser needs to show a saved item (prepared on the server). */
export type SavedIndexItem = {
  slug: string;
  kind: WorkKind;
  title: string;
  /** "कहानी, मार्च 2026" */
  meta: string;
  coverUrl: string | null;
  releases: Release[];
};

type Props = {
  /** Every published catalog work; the saved ones are picked from here. */
  index: SavedIndexItem[];
  limit: number;
  messages: Pick<Messages, "home" | "release" | "a11y" | "kinds" | "site">;
};

/**
 * "आपकी सहेजी रचनाएँ" (DESIGN.md §7.1). Shown only when the reader has saved
 * something. Saved slugs live in this browser (lib/saved.ts); nothing renders
 * on the server, so readers with nothing saved see no layout shift.
 */
export function SavedWorks({ index, limit, messages: m }: Props) {
  const { slugs, remove, prune } = useSavedWorks();
  const routes = routesFor(localeOf(usePathname()));
  const s = m.home.saved;

  // Drop saved slugs that no longer resolve (deleted or unpublished works).
  useEffect(() => {
    if (slugs.length) prune(index.map((w) => w.slug));
  }, [slugs.length, index, prune]);

  const bySlug = new Map(index.map((w) => [w.slug, w]));
  const saved = slugs.map((slug) => bySlug.get(slug)).filter((w): w is SavedIndexItem => !!w);
  if (saved.length === 0) return null;

  return (
    <section aria-labelledby="saved-heading" className="rounded-panel border border-line bg-paper-raised p-5 desk:p-7">
      <div className="flex flex-col gap-4 desk:flex-row desk:items-start desk:justify-between">
        <div>
          <h2 id="saved-heading" className="flex items-center gap-3 text-h3">
            <BookmarkIcon filled size={22} className="text-walnut" />
            {s.heading}
          </h2>
          <p className="mt-1 text-meta text-ink-soft">{s.note}</p>
        </div>
        <Link
          href={`${routes.works}?saved=1`}
          className="hidden min-h-11 items-center text-ui font-semibold text-walnut underline underline-offset-4 desk:inline-flex"
        >
          {format(s.viewAll, { count: saved.length })}
        </Link>
      </div>

      <ul className="mt-5 grid gap-x-8 desk:grid-cols-4">
        {saved.slice(0, limit).map((w) => (
          <li key={w.slug} className="flex gap-3 border-t border-line py-4">
            <ClothCover kind={w.kind} title={w.title} kindLabel={m.kinds[w.kind]} byline={m.site.name} size="small" imageUrl={w.coverUrl} />
            <div className="min-w-0">
              <Link
                href={w.kind === "series" ? routes.book(w.slug) : routes.work(w.slug)}
                lang="hi"
                className="font-heading text-[1.25rem] leading-snug text-ink underline decoration-turmeric decoration-2 underline-offset-[5px]"
              >
                {w.title}
              </Link>
              <p className="text-meta text-ink-soft">{w.meta}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <ActionPills
                  releases={w.releases}
                  workHref={w.kind === "series" ? routes.book(w.slug) : routes.work(w.slug)}
                  messages={m}
                />
                <button
                  type="button"
                  onClick={() => remove(w.slug)}
                  aria-label={format(s.removeLabel, { title: w.title })}
                  className="relative min-h-8 text-meta font-semibold text-walnut underline underline-offset-4 before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-['']"
                >
                  {s.remove}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href={`${routes.works}?saved=1`}
        className="mt-2 flex min-h-13 w-full items-center justify-center rounded-control border border-line-strong bg-paper text-ui font-semibold text-ink desk:hidden"
      >
        {format(s.viewAll, { count: saved.length })}
      </Link>
    </section>
  );
}
