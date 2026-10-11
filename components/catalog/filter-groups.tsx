"use client";

import { CATALOG_FORMATS, type CatalogCounts, type CatalogFormat, type CatalogParams } from "@/lib/catalog/rules";
import type { Genre, Platform } from "@/lib/data/types";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  params: CatalogParams;
  counts: CatalogCounts;
  savedCount: number;
  genres: Genre[];
  platforms: Platform[];
  onChange: (patch: Partial<CatalogParams>) => void;
  messages: Messages["catalog"];
  /** Prefix for input ids (two copies exist: sidebar and phone panel). */
  idPrefix: string;
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Row({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 text-ui">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-[1.375rem] shrink-0 cursor-pointer rounded-[4px] border border-line-strong accent-walnut"
        />
        <span className="flex-1">{label}</span>
        <span className="text-meta text-ink-soft">{count}</span>
      </label>
    </li>
  );
}

/** The four filter groups (DESIGN.md §7.2), as checkbox rows with counts. */
export function FilterGroups({ params, counts, savedCount, genres, platforms, onChange, messages: m, idPrefix }: Props) {
  const g = m.filters.groups;
  const groupClass = "border-b border-line py-3 last:border-b-0";
  const legendClass = "pt-1 pb-1 text-ui font-bold";

  return (
    <div>
      <fieldset className={groupClass}>
        <legend className={legendClass}>{g.saved}</legend>
        <ul>
          <Row
            id={`${idPrefix}-saved`}
            label={m.filters.savedOnly}
            count={savedCount}
            checked={params.saved}
            onChange={() => onChange({ saved: !params.saved })}
          />
        </ul>
      </fieldset>

      <fieldset className={groupClass}>
        <legend className={legendClass}>{g.formats}</legend>
        <ul>
          {CATALOG_FORMATS.map((f: CatalogFormat) => (
            <Row
              key={f}
              id={`${idPrefix}-format-${f}`}
              label={m.filters.formats[f]}
              count={counts.formats[f] ?? 0}
              checked={params.formats.includes(f)}
              onChange={() => onChange({ formats: toggle(params.formats, f) })}
            />
          ))}
        </ul>
      </fieldset>

      {genres.length > 0 && (
        <fieldset className={groupClass}>
          <legend className={legendClass}>{g.genres}</legend>
          <ul>
            {genres.map((genre) => (
              <Row
                key={genre.slug}
                id={`${idPrefix}-genre-${genre.slug}`}
                label={genre.name}
                count={counts.genres[genre.slug] ?? 0}
                checked={params.genres.includes(genre.slug)}
                onChange={() => onChange({ genres: toggle(params.genres, genre.slug) })}
              />
            ))}
          </ul>
        </fieldset>
      )}

      {platforms.length > 0 && (
        <fieldset className={groupClass}>
          <legend className={legendClass}>{g.platforms}</legend>
          <ul>
            {platforms.map((p) => (
              <Row
                key={p.slug}
                id={`${idPrefix}-platform-${p.slug}`}
                label={p.name}
                count={counts.platforms[p.slug] ?? 0}
                checked={params.platforms.includes(p.slug)}
                onChange={() => onChange({ platforms: toggle(params.platforms, p.slug) })}
              />
            ))}
          </ul>
        </fieldset>
      )}
    </div>
  );
}
