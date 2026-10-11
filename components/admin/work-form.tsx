"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteWork, saveWork } from "@/app/admin/works/actions";
import type { Store } from "@/lib/data/store";
import type { WorkKind } from "@/lib/data/types";
import type { AdminMessages } from "@/lib/admin/messages";
import { slugify } from "@/lib/admin/slug";
import type { ErrorCode, FieldErrors, ReleaseInput, WorkInput } from "@/lib/admin/work-input";
import { ALL_KINDS, allowedChildKinds, isParentKind, publicHref } from "@/lib/admin/works";
import { format } from "@/lib/i18n/format";
import { MediaField } from "./media-field";
import { MembersEditor } from "./members-editor";
import { ReleasesEditor } from "./releases-editor";
import { Button, Checkbox, Field, SaveStatus, Section, inputClass, selectClass, textareaClass, useUnsavedWarning } from "./ui";
import { WorkPreview } from "./work-preview";

type Props = { store: Store; workId: string | null; messages: AdminMessages };

function initialValues(store: Store, workId: string | null): WorkInput {
  const w = workId ? store.works.find((x) => x.id === workId) : undefined;
  if (!w) {
    return {
      id: null, kind: "story", status: "draft", title: "", slug: "", publishedOn: "", featured: false,
      synopsis: "", excerpt: "", coverPath: null, genreIds: [], editor: "", featuredContributors: ["", "", ""],
      contributorsTotal: "", releases: [], memberIds: [],
    };
  }
  const contributors = [...w.featured_contributors, "", "", ""].slice(0, 3);
  return {
    id: w.id,
    kind: w.kind,
    status: w.status,
    title: w.title_hi,
    slug: w.slug,
    publishedOn: w.published_on ?? "",
    featured: w.featured,
    synopsis: w.synopsis_hi ?? "",
    excerpt: w.excerpt_hi ?? "",
    coverPath: w.cover_path,
    genreIds: store.workGenres.filter((g) => g.work_id === w.id).map((g) => g.genre_id),
    editor: w.editor ?? "",
    featuredContributors: contributors,
    contributorsTotal: w.contributors_total?.toString() ?? "",
    releases: store.releases
      .filter((r) => r.work_id === w.id)
      .map((r) => ({
        id: r.id,
        format: r.format,
        platformId: r.platform_id,
        url: r.url,
        releasedOn: r.released_on ?? "",
        chapterCount: r.chapter_count?.toString() ?? "",
        narrator: r.narrator ?? "",
        publisher: r.publisher ?? "",
        isbn: r.isbn ?? "",
      })),
    memberIds: store.members
      .filter((m) => m.parent_id === w.id)
      .sort((a, b) => a.position - b.position)
      .map((m) => m.child_id),
  };
}

/** Add / edit a work (DESIGN.md §10): details, cover, genres, releases, members, live preview. */
export function WorkForm({ store, workId, messages }: Props) {
  const m = messages.workForm;
  const router = useRouter();
  const params = useSearchParams();
  const [initial] = useState(() => initialValues(store, workId));
  const [values, setValues] = useState<WorkInput>(initial);
  // The slug follows the title until it's edited by hand (new works only).
  const [slugTouched, setSlugTouched] = useState(workId !== null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ kind: "idle" | "saved" | "error"; message?: string }>(() =>
    params.get("saved") ? { kind: "saved", message: messages.common.saved } : { kind: "idle" },
  );
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);
  useUnsavedWarning(dirty && !pending, m.leaveWarning);

  // Drop "?saved=1" from the address once shown.
  useEffect(() => {
    if (params.get("saved")) window.history.replaceState(null, "", window.location.pathname);
  }, [params]);

  const saved = workId ? store.works.find((w) => w.id === workId) : undefined;
  const parents = workId
    ? store.members.filter((x) => x.child_id === workId).flatMap((x) => store.works.filter((w) => w.id === x.parent_id))
    : [];

  const set = <K extends keyof WorkInput>(key: K, value: WorkInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (status.kind !== "idle") setStatus({ kind: "idle" });
  };

  const errorText = (code: ErrorCode | undefined, extra: Record<string, string | number> = {}): string | null => {
    if (!code) return null;
    switch (code) {
      case "kindLocked":
        return m.kindLocked;
      case "kindInParent":
        return m.kindInParent;
      case "contributorsTotalTooSmall":
        return format(m.contributorsTotalTooSmall, extra);
      default:
        return messages.common[code];
    }
  };

  function submit() {
    startTransition(async () => {
      setStatus({ kind: "idle" });
      const result = await saveWork(values);
      if (result.ok) {
        setErrors({});
        // Reload with fresh data (new ids); the form remounts and shows "Saved".
        if (!workId) router.replace(`/admin/works/${result.id}?saved=1`);
        else {
          router.replace(`/admin/works/${result.id}?saved=1`);
          router.refresh();
        }
        return;
      }
      setErrors(result.errors);
      setStatus({
        kind: "error",
        message: result.message ? format(messages.common.saveFailed, { reason: result.message }) : messages.common.fixErrors,
      });
      // Bring the first problem into view.
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true], [data-error=true]")?.focus());
    });
  }

  const kindOptions = ALL_KINDS.filter((k) => !(values.memberIds.length > 0 && !isParentKind(k)));
  const featuredCount = values.featuredContributors.filter((s) => s.trim()).length;
  const isPublishedSlugChange = saved?.status === "published" && values.slug !== saved.slug;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Link href="/admin/works" className="inline-flex min-h-11 items-center text-ui font-medium text-walnut underline underline-offset-4">
        ‹ {m.back}
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <h1 lang={values.title ? "hi" : undefined} className="text-display">
          {values.title || m.newTitle}
        </h1>
        {saved?.status === "published" && (
          <a
            href={publicHref(saved.kind, saved.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-ui font-medium text-walnut underline underline-offset-4"
          >
            {messages.common.viewOnSite} ↗<span className="sr-only"> {messages.common.newWindow}</span>
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 desk:grid-cols-[minmax(0,1fr)_22rem] desk:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Status: a deliberate choice, at the top */}
          <fieldset className="rounded-panel border border-line bg-paper-raised p-4 tab:p-6">
            <legend className="sr-only">{m.statusLabel}</legend>
            <p aria-hidden="true" className="text-h3">
              {m.statusLabel}
            </p>
            <p className="mt-1 text-meta text-ink-soft">{m.statusHint}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 tab:inline-grid">
              {(["draft", "published"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-control border px-5 text-ui font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
                    values.status === s ? "border-walnut bg-walnut text-on-walnut" : "border-line-strong bg-paper-raised"
                  }`}
                >
                  <input type="radio" name="status" value={s} checked={values.status === s} onChange={() => set("status", s)} className="sr-only" />
                  {messages.status[s]}
                </label>
              ))}
            </div>
          </fieldset>

          <Section title={m.basics} id="basics">
            <div className="grid gap-5">
              <Field label={m.kind} error={errorText(errors.kind)} hint={values.memberIds.length > 0 ? m.kindLocked : undefined}>
                {({ id, describedBy, invalid }) => (
                  <select
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={values.kind}
                    onChange={(e) => set("kind", e.target.value as WorkKind)}
                    className={`${selectClass} tab:max-w-80`}
                  >
                    {kindOptions.map((k) => (
                      <option key={k} value={k}>
                        {messages.kinds[k]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label={m.titleHi} error={errorText(errors.title)}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    lang="hi"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={values.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setValues((v) => ({ ...v, title, slug: slugTouched ? v.slug : slugify(title) }));
                      if (status.kind !== "idle") setStatus({ kind: "idle" });
                    }}
                    className={`${inputClass} font-heading text-lead`}
                  />
                )}
              </Field>
              <div>
                <Field label={m.slug} hint={m.slugHint} error={errorText(errors.slug)}>
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      value={values.slug}
                      autoCapitalize="none"
                      spellCheck={false}
                      onChange={(e) => {
                        setSlugTouched(true);
                        set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }}
                      className={inputClass}
                    />
                  )}
                </Field>
                <div className="mt-1 flex flex-wrap items-center gap-x-4">
                  <Button
                    variant="quiet"
                    className="px-0"
                    onClick={() => {
                      setSlugTouched(false);
                      set("slug", slugify(values.title));
                    }}
                  >
                    {m.regenerate}
                  </Button>
                  {values.slug && (
                    <span className="text-meta text-ink-soft">{format(m.addressPreview, { path: publicHref(values.kind, values.slug) })}</span>
                  )}
                </div>
                {isPublishedSlugChange && <p className="mt-1 rounded-control border-l-4 border-walnut bg-label-paper px-3 py-2 text-meta font-semibold">{m.slugPublishedWarning}</p>}
              </div>
              <div className="grid gap-5 tab:grid-cols-2">
                <Field label={m.publishedOn} hint={m.publishedOnHint} error={errorText(errors.publishedOn)}>
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="date"
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      value={values.publishedOn}
                      onChange={(e) => set("publishedOn", e.target.value)}
                      className={inputClass}
                    />
                  )}
                </Field>
                <div className="tab:pt-8">
                  <Checkbox label={m.featured} checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
                </div>
              </div>
            </div>
          </Section>

          <Section title={m.text} id="text">
            <div className="grid gap-5">
              <Field label={m.synopsis}>
                {({ id, describedBy }) => (
                  <textarea
                    id={id}
                    lang="hi"
                    rows={4}
                    aria-describedby={describedBy}
                    value={values.synopsis}
                    onChange={(e) => set("synopsis", e.target.value)}
                    className={textareaClass}
                  />
                )}
              </Field>
              <Field label={m.excerpt} hint={m.excerptHint}>
                {({ id, describedBy }) => (
                  <textarea
                    id={id}
                    lang="hi"
                    rows={5}
                    aria-describedby={describedBy}
                    value={values.excerpt}
                    onChange={(e) => set("excerpt", e.target.value)}
                    className={textareaClass}
                  />
                )}
              </Field>
            </div>
          </Section>

          <Section title={m.cover} id="cover">
            <MediaField
              label={m.cover}
              hint={m.coverHint}
              folder="covers"
              value={values.coverPath}
              onChange={(path) => set("coverPath", path)}
              messages={messages.media}
            />
          </Section>

          <Section title={m.genres} id="genres">
            {store.genres.length === 0 ? (
              <p className="text-ui text-ink-soft">{m.noGenres}</p>
            ) : (
              <fieldset>
                <legend className="sr-only">{m.genres}</legend>
                <div className="grid gap-x-6 tab:grid-cols-2 desk:grid-cols-3">
                  {store.genres.map((g) => (
                    <Checkbox
                      key={g.id}
                      label={
                        <>
                          <span lang="hi">{g.name_hi}</span>
                          {g.name_en && <span className="text-ink-soft"> · {g.name_en}</span>}
                        </>
                      }
                      checked={values.genreIds.includes(g.id)}
                      onChange={(e) =>
                        set("genreIds", e.target.checked ? [...values.genreIds, g.id] : values.genreIds.filter((x) => x !== g.id))
                      }
                    />
                  ))}
                </div>
              </fieldset>
            )}
          </Section>

          {values.kind === "anthology" && (
            <Section title={m.anthology} id="anthology">
              <div className="grid gap-5">
                <Field label={m.editor}>
                  {({ id, describedBy }) => (
                    <input id={id} lang="hi" aria-describedby={describedBy} value={values.editor} onChange={(e) => set("editor", e.target.value)} className={inputClass} />
                  )}
                </Field>
                <fieldset>
                  <legend className="text-ui font-semibold">{m.featuredContributors}</legend>
                  <p className="text-meta text-ink-soft">{m.featuredContributorsHint}</p>
                  <div className="mt-2 grid gap-3 tab:grid-cols-3">
                    {values.featuredContributors.map((name, i) => (
                      <input
                        key={i}
                        lang="hi"
                        aria-label={format(m.contributor, { n: i + 1 })}
                        value={name}
                        onChange={(e) => set("featuredContributors", values.featuredContributors.map((x, j) => (j === i ? e.target.value : x)))}
                        className={inputClass}
                      />
                    ))}
                  </div>
                </fieldset>
                <Field
                  label={m.contributorsTotal}
                  hint={m.contributorsTotalHint}
                  error={errorText(errors.contributorsTotal, { min: 1 + featuredCount })}
                >
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      inputMode="numeric"
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      value={values.contributorsTotal}
                      onChange={(e) => set("contributorsTotal", e.target.value)}
                      className={`${inputClass} tab:max-w-40`}
                    />
                  )}
                </Field>
              </div>
            </Section>
          )}

          <ReleasesEditor
            releases={values.releases}
            onChange={(releases: ReleaseInput[]) => set("releases", releases)}
            platforms={store.platforms}
            errors={errors}
            errorText={errorText}
            messages={messages}
          />

          {isParentKind(values.kind) && (
            <MembersEditor
              kind={values.kind}
              memberIds={values.memberIds}
              onChange={(ids) => set("memberIds", ids)}
              works={store.works}
              selfId={workId}
              allowedKinds={allowedChildKinds(values.kind)}
              errors={errors}
              messages={messages}
            />
          )}

          {workId && (
            <Section title={m.appearsIn} id="appears-in">
              {parents.length === 0 ? (
                <p className="text-ui text-ink-soft">{m.appearsInNone}</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {parents.map((p) => (
                    <li key={p.id}>
                      <Link href={`/admin/works/${p.id}`} lang="hi" className="inline-flex min-h-11 items-center text-ui font-medium text-walnut underline underline-offset-4">
                        {p.title_hi}
                      </Link>
                      <span className="text-meta text-ink-soft"> · {messages.kinds[p.kind]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {workId && saved && <DeleteWork id={workId} title={saved.title_hi} messages={messages} />}
        </div>

        <aside className="desk:sticky desk:top-4">
          <WorkPreview values={values} store={store} messages={m} />
        </aside>
      </div>

      {/* Save bar, always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-strong bg-paper-raised">
        <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-2 px-4 py-3 tab:flex-row tab:items-center tab:justify-between tab:px-6 desk:px-8">
          <SaveStatus status={dirty && status.kind === "idle" ? { kind: "error", message: messages.common.unsaved } : status} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-walnut px-8 text-ui font-semibold text-on-walnut hover:bg-walnut-dark disabled:opacity-45 tab:w-auto"
          >
            {pending ? messages.common.saving : workId ? m.save : m.create}
          </button>
        </div>
      </div>
    </form>
  );
}

function DeleteWork({ id, title, messages }: { id: string; title: string; messages: AdminMessages }) {
  const m = messages.workForm;
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section aria-labelledby="delete-title" className="rounded-panel border-2 border-dashed border-line-strong p-4 tab:p-6">
      <h2 id="delete-title" className="text-h3">
        {m.deleteTitle}
      </h2>
      <p className="mt-2 text-ui text-ink-soft">{m.deleteBody}</p>
      <Field label={format(m.deleteConfirm, { title })} className="mt-4">
        {({ id: inputId, describedBy }) => (
          <input id={inputId} lang="hi" aria-describedby={describedBy} value={typed} onChange={(e) => setTyped(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Button
        variant="danger"
        className="mt-4 w-full tab:w-auto"
        disabled={typed.trim() !== title.trim() || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteWork(id);
            if (result && !result.ok) setError(format(messages.common.saveFailed, { reason: result.message }));
          })
        }
      >
        {m.deleteButton}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-ui font-semibold text-walnut">
          {error}
        </p>
      )}
    </section>
  );
}
