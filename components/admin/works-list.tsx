"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CLOTH_VAR } from "@/components/cover/cloth-cover";
import { SearchIcon } from "@/components/icons";
import { imageUrl } from "@/lib/data/images";
import { normalizeSearchText } from "@/lib/data/search";
import type { AdminMessages } from "@/lib/admin/messages";
import { ALL_KINDS, publicHref, type AdminWorkRow } from "@/lib/admin/works";
import { format } from "@/lib/i18n/format";
import { Pill, inputClass, selectClass } from "./ui";

const PAGE = 50;
const SORTS = ["updated", "title", "published"] as const;
type Sort = (typeof SORTS)[number];
const STATUSES = ["published", "draft"] as const;

const titleCollator = new Intl.Collator("hi");
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const formatAdminDate = (value: string | null) => (value ? dateFormat.format(new Date(value)) : null);

/** Works list with search, kind and status filters, sort; state kept in the address. */
export function WorksList({ rows, messages }: { rows: AdminWorkRow[]; messages: AdminMessages }) {
  const m = messages.worksList;
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [kind, setKind] = useState(ALL_KINDS.find((k) => k === params.get("kind")) ?? null);
  const [status, setStatus] = useState(STATUSES.find((s) => s === params.get("status")) ?? null);
  const [sort, setSort] = useState<Sort>(SORTS.find((s) => s === params.get("sort")) ?? "updated");
  const [limit, setLimit] = useState(PAGE);

  // Keep the view in the address so reload and Back restore it.
  const sync = (next: { q?: string; kind?: string | null; status?: string | null; sort?: Sort }) => {
    const values = { q, kind, status, sort, ...next };
    const search = new URLSearchParams();
    if (values.q.trim()) search.set("q", values.q.trim());
    if (values.kind) search.set("kind", values.kind);
    if (values.status) search.set("status", values.status);
    if (values.sort !== "updated") search.set("sort", values.sort);
    const qs = search.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    setLimit(PAGE);
  };

  const needle = normalizeSearchText(q);
  const matchesSearch = (r: AdminWorkRow) => !needle || r.search.includes(needle);
  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) if (matchesSearch(r) && (!status || r.status === status)) counts[r.kind] = (counts[r.kind] ?? 0) + 1;
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, needle, status]);

  const filtered = rows
    .filter((r) => matchesSearch(r) && (!kind || r.kind === kind) && (!status || r.status === status))
    .sort((a, b) =>
      sort === "title"
        ? titleCollator.compare(a.title, b.title)
        : sort === "published"
          ? (b.publishedOn ?? "").localeCompare(a.publishedOn ?? "")
          : b.updatedAt.localeCompare(a.updatedAt),
    );
  const shown = filtered.slice(0, limit);
  const filtersActive = !!(q.trim() || kind || status);

  const chip = (selected: boolean) =>
    `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-ui font-medium ${
      selected ? "border-walnut bg-walnut text-on-walnut" : "border-line-strong bg-paper-raised hover:bg-label-paper"
    }`;

  return (
    <div className="mt-8">
      <div className="grid gap-4 desk:grid-cols-[minmax(0,1fr)_auto_auto] desk:items-end">
        <div>
          <label htmlFor="works-search" className="mb-1.5 block text-ui font-semibold">
            {m.search}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-soft" />
            <input
              id="works-search"
              type="search"
              value={q}
              placeholder={m.searchPlaceholder}
              autoComplete="off"
              onChange={(e) => {
                setQ(e.target.value);
                sync({ q: e.target.value });
              }}
              className={`${inputClass} pl-12`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="works-status" className="mb-1.5 block text-ui font-semibold">
            {m.statusLabel}
          </label>
          <select
            id="works-status"
            value={status ?? ""}
            onChange={(e) => {
              const value = STATUSES.find((s) => s === e.target.value) ?? null;
              setStatus(value);
              sync({ status: value });
            }}
            className={selectClass}
          >
            <option value="">{m.all}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {messages.status[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="works-sort" className="mb-1.5 block text-ui font-semibold">
            {m.sortLabel}
          </label>
          <select
            id="works-sort"
            value={sort}
            onChange={(e) => {
              const value = SORTS.find((s) => s === e.target.value) ?? "updated";
              setSort(value);
              sync({ sort: value });
            }}
            className={selectClass}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {m.sort[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-ui font-semibold">{m.kindLabel}</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!kind}
            onClick={() => {
              setKind(null);
              sync({ kind: null });
            }}
            className={chip(!kind)}
          >
            {m.all}
          </button>
          {ALL_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => {
                const value = kind === k ? null : k;
                setKind(value);
                sync({ kind: value });
              }}
              className={chip(kind === k)}
            >
              {messages.kinds[k]}
              <span className={kind === k ? "text-on-walnut" : "text-ink-soft"}>{kindCounts[k] ?? 0}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-2">
        <p aria-live="polite" className="text-ui font-semibold">
          {format(m.count, { shown: filtered.length, total: rows.length })}
        </p>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setKind(null);
              setStatus(null);
              sync({ q: "", kind: null, status: null });
            }}
            className="min-h-11 text-ui font-medium text-walnut underline underline-offset-4"
          >
            {m.clear}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-body text-ink-soft">{m.empty}</p>
      ) : (
        <ul>
          {shown.map((r) => (
            <WorkListRow key={r.id} row={r} messages={messages} />
          ))}
        </ul>
      )}

      {filtered.length > shown.length && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex min-h-12 items-center rounded-control border border-line-strong bg-paper-raised px-6 text-ui font-semibold hover:bg-label-paper"
          >
            {m.showMore}
          </button>
        </div>
      )}
    </div>
  );
}

function WorkListRow({ row: r, messages }: { row: AdminWorkRow; messages: AdminMessages }) {
  const m = messages.worksList;
  const releases = r.releaseCount === 0 ? m.noReleases : r.releaseCount === 1 ? m.oneRelease : format(m.releases, { count: r.releaseCount });
  const published = formatAdminDate(r.publishedOn);

  return (
    <li className="flex gap-4 border-b border-line py-4">
      <div
        aria-hidden="true"
        className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-[2px_5px_5px_2px] desk:w-14"
        style={{ backgroundColor: CLOTH_VAR[r.kind] }}
      >
        {r.coverPath ? (
          <Image src={imageUrl(r.coverPath)} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <span className="absolute inset-x-1.5 top-1/3 h-3 rounded-[1px] bg-label-paper/90" />
        )}
      </div>
      <div className="min-w-0 flex-1 desk:grid desk:grid-cols-[minmax(0,1fr)_9rem_8rem_9rem] desk:items-start desk:gap-4">
        <div className="min-w-0">
          <Link
            href={`/admin/works/${r.id}`}
            lang="hi"
            className="font-heading text-lead text-ink underline decoration-turmeric decoration-2 underline-offset-[5px] hover:decoration-[3px]"
          >
            {r.title}
          </Link>
          <p className="mt-0.5 truncate text-meta text-ink-soft">/{r.slug}</p>
          {r.parents.length > 0 && (
            <p className="mt-0.5 text-meta text-ink-soft">
              {format(m.partOf, { titles: "" })}
              <span lang="hi">{r.parents.join(", ")}</span>
            </p>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 desk:mt-1 desk:flex-col desk:items-start">
          <Pill tone={r.status === "published" ? "strong" : "dashed"}>{messages.status[r.status]}</Pill>
          <span className="text-meta text-ink">{messages.kinds[r.kind]}</span>
          {r.featured && <span className="text-meta font-semibold text-walnut">★ {m.featured}</span>}
        </div>
        <p className="mt-1 text-meta text-ink-soft desk:mt-1.5">
          {releases}
          <span className="desk:hidden"> · </span>
          <span className="desk:block">{published ? format(m.published, { date: published }) : m.notDated}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 text-meta text-ink-soft desk:mt-1.5 desk:flex-col desk:items-start">
          <span>{format(m.edited, { date: formatAdminDate(r.updatedAt) ?? "" })}</span>
          {r.status === "published" && (
            <a
              href={publicHref(r.kind, r.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-medium text-walnut underline underline-offset-4 desk:min-h-0"
            >
              {messages.common.viewOnSite} ↗<span className="sr-only"> {messages.common.newWindow}</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
