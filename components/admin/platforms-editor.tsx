"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteGenre,
  deletePlatform,
  reorderPlatforms,
  saveGenre,
  savePlatform,
  type GenreInput,
  type PlatformInput,
} from "@/app/admin/platforms/actions";
import type { PlatformsAdminData } from "@/lib/admin/data";
import type { AdminMessages } from "@/lib/admin/messages";
import { slugify } from "@/lib/admin/slug";
import type { ActionResult, CommonError } from "@/lib/admin/validate";
import { imageUrl } from "@/lib/data/images";
import { format } from "@/lib/i18n/format";
import { MediaField } from "./media-field";
import { Button, Field, SaveStatus, Section, inputClass, useUnsavedWarning } from "./ui";

type Status = { kind: "idle" | "saved" | "error"; message?: string };
const smallButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-paper-raised text-ui font-semibold hover:bg-label-paper disabled:opacity-30";

/** Turns an action result into field errors and a status line. */
function useSaver(messages: AdminMessages) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Partial<Record<string, CommonError>>>({});
  const run = (action: () => Promise<ActionResult>, onOk?: () => void) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setErrors({});
        setStatus({ kind: "saved", message: messages.common.saved });
        onOk?.();
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setStatus({
          kind: "error",
          message: result.message ? format(messages.common.saveFailed, { reason: result.message }) : messages.common.fixErrors,
        });
      }
    });
  return { pending, status, errors, run, setStatus };
}

export function PlatformsAndGenres({ data, messages }: { data: PlatformsAdminData; messages: AdminMessages }) {
  return (
    <div className="mt-8 flex flex-col gap-8">
      <PlatformsSection data={data} messages={messages} />
      <GenresSection data={data} messages={messages} />
    </div>
  );
}

// ---------------------------------------------------------------- Platforms

function PlatformsSection({ data, messages }: { data: PlatformsAdminData; messages: AdminMessages }) {
  const m = messages.platforms;
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const order = useSaver(messages);
  const ids = data.platforms.map((p) => p.id);

  const move = (i: number, by: -1 | 1) => {
    const next = [...ids];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    order.run(() => reorderPlatforms(next));
  };

  return (
    <Section title={m.platformsTitle} description={m.platformsHint} id="platforms">
      <ul className="border-t border-line">
        {data.platforms.map((p, i) => {
          const used = data.releaseCounts[p.id] ?? 0;
          return (
            <li key={p.id} className="border-b border-line py-3">
              <div className="flex items-center gap-3">
                <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line bg-paper">
                  {p.logo_path ? (
                    <Image src={imageUrl(p.logo_path)} alt="" fill sizes="44px" className="object-contain p-1" />
                  ) : (
                    <span aria-hidden="true" className="text-meta font-semibold text-ink-soft">
                      {(p.name_en || p.name_hi).charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-ui font-semibold">
                    {p.name_en || p.name_hi}
                    {p.name_en && p.name_en !== p.name_hi && (
                      <span lang="hi" className="font-normal text-ink-soft">
                        {" "}
                        · {p.name_hi}
                      </span>
                    )}
                  </span>
                  <span className="block text-meta text-ink-soft">{format(m.used, { count: used })}</span>
                </span>
                <button type="button" className={smallButton} disabled={i === 0 || order.pending} onClick={() => move(i, -1)} aria-label={`${messages.common.moveUp}: ${p.name_en || p.name_hi}`}>
                  ↑
                </button>
                <button
                  type="button"
                  className={smallButton}
                  disabled={i === ids.length - 1 || order.pending}
                  onClick={() => move(i, 1)}
                  aria-label={`${messages.common.moveDown}: ${p.name_en || p.name_hi}`}
                >
                  ↓
                </button>
                <Button onClick={() => setEditing(editing === p.id ? null : p.id)} aria-expanded={editing === p.id}>
                  {messages.common.edit}
                </Button>
              </div>
              {editing === p.id && (
                <PlatformForm
                  initial={{
                    id: p.id,
                    nameHi: p.name_hi,
                    nameEn: p.name_en ?? "",
                    slug: p.slug,
                    profileUrl: p.profile_url ?? "",
                    descriptionHi: p.description_hi ?? "",
                    descriptionEn: p.description_en ?? "",
                    logoPath: p.logo_path,
                  }}
                  usedBy={used}
                  onDone={() => setEditing(null)}
                  messages={messages}
                />
              )}
            </li>
          );
        })}
      </ul>
      <SaveStatus status={order.status} />
      {editing === "new" ? (
        <PlatformForm
          initial={{ id: null, nameHi: "", nameEn: "", slug: "", profileUrl: "", descriptionHi: "", descriptionEn: "", logoPath: null }}
          usedBy={0}
          onDone={() => setEditing(null)}
          messages={messages}
        />
      ) : (
        <Button className="mt-2 w-full tab:w-auto" onClick={() => setEditing("new")}>
          + {m.add}
        </Button>
      )}
    </Section>
  );
}

function PlatformForm({ initial, usedBy, onDone, messages }: { initial: PlatformInput; usedBy: number; onDone: () => void; messages: AdminMessages }) {
  const m = messages.platforms;
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(initial.id !== null);
  const saver = useSaver(messages);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedWarning(dirty && !saver.pending, messages.workForm.leaveWarning);
  const set = (patch: Partial<PlatformInput>) => setValues((v) => ({ ...v, ...patch }));
  const err = (k: string) => (saver.errors[k] ? messages.common[saver.errors[k]!] : null);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        saver.run(() => savePlatform(values), initial.id ? undefined : onDone);
      }}
      className="mt-3 rounded-panel border border-line bg-paper p-4"
    >
      {!initial.id && <h3 className="mb-4 text-h3">{m.newPlatform}</h3>}
      <div className="grid gap-4 tab:grid-cols-2">
        <Field label={m.nameEn}>
          {({ id, describedBy }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              value={values.nameEn}
              onChange={(e) => {
                const nameEn = e.target.value;
                set({ nameEn, slug: slugTouched ? values.slug : nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
              }}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={m.nameHi} error={err("nameHi")}>
          {({ id, describedBy, invalid }) => (
            <input id={id} lang="hi" aria-describedby={describedBy} aria-invalid={invalid} value={values.nameHi} onChange={(e) => set({ nameHi: e.target.value })} className={inputClass} />
          )}
        </Field>
        <Field label={m.slug} error={err("slug")}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              autoCapitalize="none"
              spellCheck={false}
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: e.target.value.toLowerCase() });
              }}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={m.profileUrl} error={err("profileUrl")}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              placeholder="https://"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={values.profileUrl}
              onChange={(e) => set({ profileUrl: e.target.value })}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={m.descriptionHi}>
          {({ id, describedBy }) => (
            <input id={id} lang="hi" aria-describedby={describedBy} value={values.descriptionHi} onChange={(e) => set({ descriptionHi: e.target.value })} className={inputClass} />
          )}
        </Field>
        <Field label={m.descriptionEn} hint={messages.common.englishHint}>
          {({ id, describedBy }) => (
            <input id={id} aria-describedby={describedBy} value={values.descriptionEn} onChange={(e) => set({ descriptionEn: e.target.value })} className={inputClass} />
          )}
        </Field>
        <div className="tab:col-span-2">
          <MediaField label={m.logo} folder="platforms" aspect="square" value={values.logoPath} onChange={(logoPath) => set({ logoPath })} messages={messages.media} />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 tab:flex-row tab:flex-wrap tab:items-center">
        <button type="submit" disabled={saver.pending} className="inline-flex min-h-12 items-center justify-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark disabled:opacity-45">
          {saver.pending ? messages.common.saving : messages.common.save}
        </button>
        <Button onClick={onDone}>{messages.common.cancel}</Button>
        {initial.id &&
          (usedBy > 0 ? (
            <span className="text-meta text-ink-soft">{format(m.inUse, { count: usedBy })}</span>
          ) : (
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(format(m.deleteConfirm, { name: initial.nameEn || initial.nameHi }))) saver.run(() => deletePlatform(initial.id!), onDone);
              }}
            >
              {messages.common.delete}
            </Button>
          ))}
      </div>
      <SaveStatus status={saver.status} />
    </form>
  );
}

// ---------------------------------------------------------------- Genres

function GenresSection({ data, messages }: { data: PlatformsAdminData; messages: AdminMessages }) {
  const m = messages.platforms;
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <Section title={m.genresTitle} id="genres">
      <ul className="border-t border-line">
        {data.genres.map((g) => (
          <li key={g.id} className="border-b border-line py-3">
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1">
                <span lang="hi" className="block text-ui font-semibold">
                  {g.name_hi}
                  {g.name_en && <span className="font-normal text-ink-soft" lang="en"> · {g.name_en}</span>}
                </span>
                <span className="block text-meta text-ink-soft">{format(m.genreUsed, { count: data.workCounts[g.id] ?? 0 })}</span>
              </span>
              <Button onClick={() => setEditing(editing === g.id ? null : g.id)} aria-expanded={editing === g.id}>
                {messages.common.edit}
              </Button>
            </div>
            {editing === g.id && (
              <GenreForm
                initial={{ id: g.id, nameHi: g.name_hi, nameEn: g.name_en ?? "", slug: g.slug }}
                usedBy={data.workCounts[g.id] ?? 0}
                onDone={() => setEditing(null)}
                messages={messages}
              />
            )}
          </li>
        ))}
      </ul>
      {editing === "new" ? (
        <GenreForm initial={{ id: null, nameHi: "", nameEn: "", slug: "" }} usedBy={0} onDone={() => setEditing(null)} messages={messages} />
      ) : (
        <Button className="mt-4 w-full tab:w-auto" onClick={() => setEditing("new")}>
          + {m.addGenre}
        </Button>
      )}
    </Section>
  );
}

function GenreForm({ initial, usedBy, onDone, messages }: { initial: GenreInput; usedBy: number; onDone: () => void; messages: AdminMessages }) {
  const m = messages.platforms;
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(initial.id !== null);
  const saver = useSaver(messages);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedWarning(dirty && !saver.pending, messages.workForm.leaveWarning);
  const set = (patch: Partial<GenreInput>) => setValues((v) => ({ ...v, ...patch }));
  const err = (k: string) => (saver.errors[k] ? messages.common[saver.errors[k]!] : null);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        saver.run(() => saveGenre(values), initial.id ? undefined : onDone);
      }}
      className="mt-3 rounded-panel border border-line bg-paper p-4"
    >
      {!initial.id && <h3 className="mb-4 text-h3">{m.newGenre}</h3>}
      <div className="grid gap-4 tab:grid-cols-3">
        <Field label={m.nameHi} error={err("nameHi")}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              lang="hi"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={values.nameHi}
              onChange={(e) => set({ nameHi: e.target.value, slug: slugTouched ? values.slug : slugify(e.target.value) })}
              className={inputClass}
            />
          )}
        </Field>
        <Field label={m.nameEn}>
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} value={values.nameEn} onChange={(e) => set({ nameEn: e.target.value })} className={inputClass} />}
        </Field>
        <Field label={m.slug} error={err("slug")}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              autoCapitalize="none"
              spellCheck={false}
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: e.target.value.toLowerCase() });
              }}
              className={inputClass}
            />
          )}
        </Field>
      </div>
      <div className="mt-5 flex flex-col gap-3 tab:flex-row tab:items-center">
        <button type="submit" disabled={saver.pending} className="inline-flex min-h-12 items-center justify-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark disabled:opacity-45">
          {saver.pending ? messages.common.saving : messages.common.save}
        </button>
        <Button onClick={onDone}>{messages.common.cancel}</Button>
        {initial.id && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm(format(m.genreDeleteConfirm, { name: initial.nameHi, count: usedBy }))) saver.run(() => deleteGenre(initial.id!), onDone);
            }}
          >
            {messages.common.delete}
          </Button>
        )}
      </div>
      <SaveStatus status={saver.status} />
    </form>
  );
}
