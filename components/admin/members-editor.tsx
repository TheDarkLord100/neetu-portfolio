"use client";

import { useState } from "react";
import type { Tables } from "@/lib/database.types";
import type { AdminMessages } from "@/lib/admin/messages";
import type { FieldErrors } from "@/lib/admin/work-input";
import { normalizeSearchText } from "@/lib/data/search";
import type { WorkKind } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import { Pill, inputClass } from "./ui";

type Props = {
  kind: WorkKind;
  memberIds: string[];
  onChange: (ids: string[]) => void;
  works: Tables<"works">[];
  selfId: string | null;
  allowedKinds: readonly WorkKind[];
  errors: FieldErrors;
  messages: AdminMessages;
};

const MAX_RESULTS = 8;
const smallButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-paper-raised text-ui font-semibold hover:bg-label-paper disabled:opacity-30";

/** Parts of a series / contents of a book: ordered list, ↑ ↓ to reorder, search to add. */
export function MembersEditor({ kind, memberIds, onChange, works, selfId, allowedKinds, errors, messages }: Props) {
  const m = messages.members;
  const [q, setQ] = useState("");
  const byId = new Map(works.map((w) => [w.id, w]));
  const isSeries = kind === "series";

  const needle = normalizeSearchText(q);
  const candidates = needle
    ? works
        .filter(
          (w) =>
            w.id !== selfId &&
            allowedKinds.includes(w.kind) &&
            !memberIds.includes(w.id) &&
            normalizeSearchText(`${w.title_hi} ${w.slug.replace(/-/g, " ")}`).includes(needle),
        )
        .slice(0, MAX_RESULTS)
    : [];

  const move = (i: number, by: -1 | 1) => {
    const next = [...memberIds];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };

  return (
    <section aria-labelledby="members-title" className="rounded-panel border border-line bg-paper-raised p-4 tab:p-6">
      <h2 id="members-title" className="text-h3">
        {isSeries ? m.partsTitle : m.contentsTitle}
      </h2>
      <p className="mt-1 text-meta text-ink-soft">{isSeries ? m.seriesHint : m.bookHint}</p>

      {memberIds.length === 0 ? (
        <p className="mt-4 text-ui text-ink-soft">{m.none}</p>
      ) : (
        <ol className="mt-4 border-t border-line">
          {memberIds.map((childId, i) => {
            const w = byId.get(childId);
            const title = w?.title_hi ?? childId;
            const invalid = !!errors[`members.${i}`];
            return (
              <li key={childId} data-error={invalid || undefined} tabIndex={invalid ? -1 : undefined} className={`flex items-center gap-3 border-b border-line py-2 ${invalid ? "bg-label-paper" : ""}`}>
                <span className="w-14 shrink-0 text-meta text-ink-soft">{isSeries ? format(m.partN, { n: i + 1 }) : `${i + 1}.`}</span>
                <span className="min-w-0 flex-1">
                  <span lang="hi" className="block text-ui font-medium">
                    {title}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-meta text-ink-soft">
                    {w && messages.kinds[w.kind]}
                    {w?.status === "draft" && <Pill tone="dashed">{messages.status.draft}</Pill>}
                  </span>
                  {invalid && <span className="block text-meta font-semibold text-walnut">{messages.common.invalidMember}</span>}
                </span>
                <button type="button" className={smallButton} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`${messages.common.moveUp}: ${title}`}>
                  ↑
                </button>
                <button
                  type="button"
                  className={smallButton}
                  disabled={i === memberIds.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`${messages.common.moveDown}: ${title}`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={smallButton}
                  onClick={() => onChange(memberIds.filter((x) => x !== childId))}
                  aria-label={format(m.removeLabel, { title })}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-5">
        <label htmlFor="members-search" className="mb-1.5 block text-ui font-semibold">
          {m.searchLabel}
        </label>
        <input
          id="members-search"
          type="search"
          lang="hi"
          autoComplete="off"
          placeholder={m.searchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={inputClass}
        />
        {needle && (
          <ul aria-live="polite" className="mt-2 rounded-control border border-line bg-paper">
            {candidates.length === 0 ? (
              <li className="px-4 py-3 text-ui text-ink-soft">{m.noMatches}</li>
            ) : (
              candidates.map((w) => (
                <li key={w.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...memberIds, w.id]);
                      setQ("");
                    }}
                    aria-label={format(m.addLabel, { title: w.title_hi })}
                    className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-label-paper"
                  >
                    <span className="text-ui font-semibold text-walnut">+</span>
                    <span lang="hi" className="flex-1 text-ui">
                      {w.title_hi}
                    </span>
                    <span className="text-meta text-ink-soft">{messages.kinds[w.kind]}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
