"use client";

import { useMemo } from "react";
import { BookCard } from "@/components/book/book-card";
import { WorkRow } from "@/components/work/work-row";
import type { Tables } from "@/lib/database.types";
import { getIndex } from "@/lib/data/map";
import type { Store } from "@/lib/data/store";
import type { AdminMessages } from "@/lib/admin/messages";
import { releaseRow, workRow, type WorkInput } from "@/lib/admin/work-input";
import { isParentKind } from "@/lib/admin/works";
import hi from "@/messages/hi.json";

const PREVIEW_ID = "preview";

/**
 * Live preview with the public site's own components and data mapping: the
 * catalog row for poems, stories, novels and series; the book card for books.
 * Rendered inert (no links or buttons to tab into).
 */
export function WorkPreview({ values, store, messages: m }: { values: WorkInput; store: Store; messages: AdminMessages["workForm"] }) {
  const preview = useMemo(() => {
    const id = values.id ?? PREVIEW_ID;
    const now = new Date(0).toISOString();
    const row: Tables<"works"> = {
      ...workRow(values),
      title_hi: values.title.trim() || "…",
      slug: values.slug || PREVIEW_ID,
      id,
      created_at: now,
      updated_at: now,
      search_text: null,
      title_en: null,
      synopsis_en: null,
    };
    const platformIds = new Set(store.platforms.map((p) => p.id));
    const draftStore: Store = {
      works: [...store.works.filter((w) => w.id !== id), row],
      releases: [
        ...store.releases.filter((r) => r.work_id !== id),
        ...values.releases
          .filter((r) => platformIds.has(r.platformId))
          .map((r, i) => ({ ...releaseRow(r, id), url: r.url || "#", id: r.id ?? `new-${i}`, created_at: now, updated_at: now })),
      ],
      platforms: store.platforms,
      genres: store.genres,
      workGenres: [...store.workGenres.filter((g) => g.work_id !== id), ...values.genreIds.map((genre_id) => ({ work_id: id, genre_id }))],
      members: [
        ...store.members.filter((x) => x.parent_id !== id),
        ...(isParentKind(values.kind) ? values.memberIds.map((child_id, position) => ({ parent_id: id, child_id, position })) : []),
      ],
    };
    const index = getIndex(draftStore, "hi");
    return { row, index };
  }, [values, store]);

  const showRow = !["collection", "anthology"].includes(values.kind);
  const showCard = isParentKind(values.kind);

  return (
    <section aria-labelledby="preview-title" className="rounded-panel border border-line bg-paper-raised p-4 tab:p-6">
      <h2 id="preview-title" className="text-h3">
        {m.preview}
      </h2>
      <p className="mt-1 text-meta text-ink-soft">{m.previewHint}</p>
      {values.status === "draft" && <p className="mt-2 text-meta font-semibold text-walnut">{m.previewDraft}</p>}
      {/* Public look: paper background, Hindi, not interactive. */}
      <div lang="hi" inert className="paper mt-4 flex flex-col gap-6 rounded-control border border-line p-4">
        {showRow && (
          <WorkRow
            work={preview.index.summary(preview.row)}
            locale="hi"
            messages={hi}
            showThumbnail
            showGenres
            showContext={false}
          />
        )}
        {showCard && <BookCard book={preview.index.bookSummary(preview.row)} locale="hi" messages={hi} />}
      </div>
    </section>
  );
}
