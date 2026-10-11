"use client";

import type { Tables } from "@/lib/database.types";
import type { AdminMessages } from "@/lib/admin/messages";
import { RELEASE_FORMATS, type ErrorCode, type FieldErrors, type ReleaseInput } from "@/lib/admin/work-input";
import type { ReleaseFormat } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import { Button, Field, Section, inputClass, selectClass } from "./ui";

type Props = {
  releases: ReleaseInput[];
  onChange: (releases: ReleaseInput[]) => void;
  platforms: Tables<"platforms">[];
  errors: FieldErrors;
  errorText: (code: ErrorCode | undefined) => string | null;
  messages: AdminMessages;
};

const blank = (platformId: string): ReleaseInput => ({
  id: null,
  format: "online",
  platformId,
  url: "",
  releasedOn: "",
  chapterCount: "",
  narrator: "",
  publisher: "",
  isbn: "",
});

/** "Where it's available": one card per release, with the fields its format uses. */
export function ReleasesEditor({ releases, onChange, platforms, errors, errorText, messages }: Props) {
  const m = messages.releases;
  const update = (i: number, patch: Partial<ReleaseInput>) => onChange(releases.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <Section title={m.title} description={m.description} id="releases">
      {platforms.length === 0 ? (
        <p className="text-ui text-ink-soft">{m.noPlatforms}</p>
      ) : (
        <>
          {releases.length === 0 && <p className="text-ui text-ink-soft">{m.none}</p>}
          <ol className="flex flex-col gap-4">
            {releases.map((r, i) => {
              const err = (field: string) => errorText(errors[`releases.${i}.${field}`]);
              return (
                <li key={r.id ?? `new-${i}`} className="rounded-panel border border-line bg-paper p-4">
                  <fieldset>
                    <legend className="sr-only">{format(m.item, { n: i + 1 })}</legend>
                    <div className="flex items-center justify-between gap-3">
                      <p aria-hidden="true" className="text-ui font-semibold">
                        {format(m.item, { n: i + 1 })}
                      </p>
                      <Button variant="quiet" onClick={() => onChange(releases.filter((_, j) => j !== i))}>
                        {messages.common.remove}
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-4 tab:grid-cols-2">
                      <Field label={m.format} error={err("format")}>
                        {({ id, describedBy, invalid }) => (
                          <select
                            id={id}
                            aria-describedby={describedBy}
                            aria-invalid={invalid}
                            value={r.format}
                            onChange={(e) => update(i, { format: e.target.value as ReleaseFormat })}
                            className={selectClass}
                          >
                            {RELEASE_FORMATS.map((f) => (
                              <option key={f} value={f}>
                                {messages.formats[f]}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                      <Field label={m.platform} error={err("platformId")}>
                        {({ id, describedBy, invalid }) => (
                          <select
                            id={id}
                            aria-describedby={describedBy}
                            aria-invalid={invalid}
                            value={r.platformId}
                            onChange={(e) => update(i, { platformId: e.target.value })}
                            className={selectClass}
                          >
                            {platforms.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name_en || p.name_hi}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                      <Field label={m.url} error={err("url")} className="tab:col-span-2">
                        {({ id, describedBy, invalid }) => (
                          <input
                            id={id}
                            type="url"
                            inputMode="url"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="https://"
                            aria-describedby={describedBy}
                            aria-invalid={invalid}
                            value={r.url}
                            onChange={(e) => update(i, { url: e.target.value })}
                            className={inputClass}
                          />
                        )}
                      </Field>
                      <Field label={m.releasedOn} error={err("releasedOn")}>
                        {({ id, describedBy, invalid }) => (
                          <input
                            id={id}
                            type="date"
                            aria-describedby={describedBy}
                            aria-invalid={invalid}
                            value={r.releasedOn}
                            onChange={(e) => update(i, { releasedOn: e.target.value })}
                            className={inputClass}
                          />
                        )}
                      </Field>
                      {r.format === "online" && (
                        <Field label={m.chapterCount} error={err("chapterCount")}>
                          {({ id, describedBy, invalid }) => (
                            <input
                              id={id}
                              inputMode="numeric"
                              aria-describedby={describedBy}
                              aria-invalid={invalid}
                              value={r.chapterCount}
                              onChange={(e) => update(i, { chapterCount: e.target.value })}
                              className={inputClass}
                            />
                          )}
                        </Field>
                      )}
                      {r.format === "audiobook" && (
                        <Field label={m.narrator}>
                          {({ id, describedBy }) => (
                            <input id={id} lang="hi" aria-describedby={describedBy} value={r.narrator} onChange={(e) => update(i, { narrator: e.target.value })} className={inputClass} />
                          )}
                        </Field>
                      )}
                      {(r.format === "print" || r.format === "ebook") && (
                        <Field label={m.publisher}>
                          {({ id, describedBy }) => (
                            <input id={id} lang="hi" aria-describedby={describedBy} value={r.publisher} onChange={(e) => update(i, { publisher: e.target.value })} className={inputClass} />
                          )}
                        </Field>
                      )}
                      {r.format === "print" && (
                        <Field label={m.isbn}>
                          {({ id, describedBy }) => (
                            <input id={id} aria-describedby={describedBy} value={r.isbn} onChange={(e) => update(i, { isbn: e.target.value })} className={inputClass} />
                          )}
                        </Field>
                      )}
                    </div>
                  </fieldset>
                </li>
              );
            })}
          </ol>
          <Button className="mt-4 w-full tab:w-auto" onClick={() => onChange([...releases, blank(platforms[0].id)])}>
            + {m.add}
          </Button>
        </>
      )}
    </Section>
  );
}
