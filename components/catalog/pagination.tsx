"use client";

import { ChevronRightIcon } from "@/components/icons";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  per: number;
  /** URL for a page (real links, so it works without JavaScript). */
  hrefFor: (page: number) => string;
  onNavigate: (page: number) => void;
  messages: Messages["catalog"]["pagination"];
};

/** First, last, current ±1, with gaps ("…") between. */
export function pageList(page: number, pageCount: number): Array<number | "gap"> {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const box = "inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-control border px-3 text-ui font-semibold";
const idle = "border-line-strong bg-paper-raised text-ink hover:bg-label-paper";
const disabled = "border-line-strong bg-paper-raised text-ink opacity-45";

/** Pagination (DESIGN.md §6.14). Desktop: numbers; phone: "पृष्ठ 2 / 4". */
export function Pagination({ page, pageCount, total, per, hrefFor, onNavigate, messages: m }: Props) {
  const from = total === 0 ? 0 : (page - 1) * per + 1;
  const to = Math.min(total, page * per);

  const link = (target: number, content: React.ReactNode, label?: string, extra = "") => (
    <a
      href={hrefFor(target)}
      aria-label={label}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate(target);
      }}
      className={`${box} ${idle} ${extra}`}
    >
      {content}
    </a>
  );
  const dead = (content: React.ReactNode, extra = "") => (
    <span aria-disabled="true" className={`${box} ${disabled} ${extra}`}>
      {content}
    </span>
  );

  const prev = (
    <>
      <ChevronRightIcon size={18} className="rotate-180" />
      {m.previous}
    </>
  );
  const next = (
    <>
      {m.next}
      <ChevronRightIcon size={18} />
    </>
  );

  return (
    <nav aria-label={m.label} className="mt-10">
      <div className="flex items-center justify-between gap-3 desk:justify-center">
        {page > 1 ? link(page - 1, prev) : dead(prev)}

        <ul className="hidden items-center gap-2 desk:flex">
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-soft">
                …
              </li>
            ) : (
              <li key={p}>
                {p === page ? (
                  <span aria-current="page" className={`${box} border-walnut bg-walnut text-on-walnut`}>
                    {p}
                  </span>
                ) : (
                  link(p, p, format(m.page, { page: p }))
                )}
              </li>
            ),
          )}
        </ul>
        <span className="text-ui font-semibold desk:hidden">{format(m.pageOf, { page, pages: pageCount })}</span>

        {page < pageCount ? link(page + 1, next) : dead(next)}
      </div>
      {total > 0 && (
        <p className="mt-4 text-center text-meta text-ink-soft">{format(m.range, { total, from, to })}</p>
      )}
    </nav>
  );
}
