"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProfile, type ProfileInput } from "@/app/admin/profile/actions";
import type { Tables } from "@/lib/database.types";
import type { AdminMessages } from "@/lib/admin/messages";
import type { CommonError } from "@/lib/admin/validate";
import { format } from "@/lib/i18n/format";
import { MediaField } from "./media-field";
import { Button, Field, SaveStatus, Section, inputClass, textareaClass, useUnsavedWarning } from "./ui";

type Status = { kind: "idle" | "saved" | "error"; message?: string };
type Pair = { key: "tagline" | "intro" | "bio" | "quote"; label: string; hint?: string; rows: number };

function toInput(p: Tables<"author_profile"> | null): ProfileInput {
  const links = Array.isArray(p?.social_links) ? (p.social_links as { name?: unknown; url?: unknown }[]) : [];
  return {
    taglineHi: p?.tagline_hi ?? "",
    taglineEn: p?.tagline_en ?? "",
    introHi: p?.intro_hi ?? "",
    introEn: p?.intro_en ?? "",
    bioHi: p?.bio_hi ?? "",
    bioEn: p?.bio_en ?? "",
    quoteHi: p?.quote_hi ?? "",
    quoteEn: p?.quote_en ?? "",
    photoPath: p?.photo_path ?? null,
    email: p?.email ?? "",
    socialLinks: links.map((l) => ({ name: String(l.name ?? ""), url: String(l.url ?? "") })),
  };
}

/** Author profile: Hindi and English side by side (stacked on phone), photo, contact, social links. */
export function ProfileForm({ profile, messages }: { profile: Tables<"author_profile"> | null; messages: AdminMessages }) {
  const m = messages.profile;
  const router = useRouter();
  const [initial, setInitial] = useState(() => toInput(profile));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<string, CommonError>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedWarning(dirty && !pending, messages.workForm.leaveWarning);

  const set = (patch: Partial<ProfileInput>) => {
    setValues((v) => ({ ...v, ...patch }));
    if (status.kind !== "idle") setStatus({ kind: "idle" });
  };
  const err = (k: string) => (errors[k] ? messages.common[errors[k]!] : null);

  const pairs: Pair[] = [
    { key: "tagline", label: m.tagline, rows: 1 },
    { key: "intro", label: m.introText, hint: m.introTextHint, rows: 3 },
    { key: "bio", label: m.bio, hint: m.bioHint, rows: 10 },
    { key: "quote", label: m.quote, rows: 2 },
  ];

  function submit() {
    startTransition(async () => {
      const result = await saveProfile(values);
      if (result.ok) {
        setErrors({});
        setInitial(values);
        setStatus({ kind: "saved", message: messages.common.saved });
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setStatus({ kind: "error", message: result.message ? format(messages.common.saveFailed, { reason: result.message }) : messages.common.fixErrors });
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mt-8 flex flex-col gap-6"
    >
      <Section title={m.photo} id="photo">
        <MediaField label={m.photo} folder="author" aspect="photo" value={values.photoPath} onChange={(photoPath) => set({ photoPath })} messages={messages.media} />
      </Section>

      {pairs.map((pair) => {
        const hiKey = `${pair.key}Hi` as const;
        const enKey = `${pair.key}En` as const;
        const Control = pair.rows > 1 ? "textarea" : "input";
        return (
          <Section key={pair.key} title={pair.label} description={pair.hint} id={pair.key}>
            <div className="grid gap-5 desk:grid-cols-2">
              <Field label={m.hindi}>
                {({ id, describedBy }) => (
                  <Control
                    id={id}
                    lang="hi"
                    rows={pair.rows > 1 ? pair.rows : undefined}
                    aria-describedby={describedBy}
                    value={values[hiKey]}
                    onChange={(e) => set({ [hiKey]: e.target.value })}
                    className={pair.rows > 1 ? textareaClass : inputClass}
                  />
                )}
              </Field>
              <Field label={m.english} hint={messages.common.englishHint}>
                {({ id, describedBy }) => (
                  <Control
                    id={id}
                    lang="en"
                    rows={pair.rows > 1 ? pair.rows : undefined}
                    aria-describedby={describedBy}
                    value={values[enKey]}
                    onChange={(e) => set({ [enKey]: e.target.value })}
                    className={pair.rows > 1 ? textareaClass : inputClass}
                  />
                )}
              </Field>
            </div>
          </Section>
        );
      })}

      <Section title={m.contact} id="contact">
        <Field label={m.email} error={err("email")}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="email"
              inputMode="email"
              autoCapitalize="none"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={values.email}
              onChange={(e) => set({ email: e.target.value })}
              className={`${inputClass} tab:max-w-[30rem]`}
            />
          )}
        </Field>

        <h3 className="mt-6 text-ui font-semibold">{m.social}</h3>
        {values.socialLinks.length === 0 && <p className="mt-1 text-ui text-ink-soft">{m.noSocial}</p>}
        <ol className="mt-2 flex flex-col gap-3">
          {values.socialLinks.map((link, i) => {
            const update = (patch: Partial<{ name: string; url: string }>) =>
              set({ socialLinks: values.socialLinks.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
            const move = (by: -1 | 1) => {
              const next = [...values.socialLinks];
              [next[i], next[i + by]] = [next[i + by], next[i]];
              set({ socialLinks: next });
            };
            return (
              <li key={i} className="grid gap-3 rounded-panel border border-line bg-paper p-3 tab:grid-cols-[12rem_minmax(0,1fr)_auto] tab:items-end">
                <Field label={m.socialName} error={err(`social.${i}.name`)}>
                  {({ id, describedBy, invalid }) => (
                    <input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={link.name} onChange={(e) => update({ name: e.target.value })} className={inputClass} />
                  )}
                </Field>
                <Field label={m.socialUrl} error={err(`social.${i}.url`)}>
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="url"
                      inputMode="url"
                      autoCapitalize="none"
                      placeholder="https://"
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      value={link.url}
                      onChange={(e) => update({ url: e.target.value })}
                      className={inputClass}
                    />
                  )}
                </Field>
                <div className="flex gap-2">
                  <Button className="size-12 px-0" disabled={i === 0} onClick={() => move(-1)} aria-label={`${messages.common.moveUp}: ${link.name}`}>
                    ↑
                  </Button>
                  <Button className="size-12 px-0" disabled={i === values.socialLinks.length - 1} onClick={() => move(1)} aria-label={`${messages.common.moveDown}: ${link.name}`}>
                    ↓
                  </Button>
                  <Button className="size-12 px-0" onClick={() => set({ socialLinks: values.socialLinks.filter((_, j) => j !== i) })} aria-label={`${messages.common.remove}: ${link.name}`}>
                    ✕
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
        <Button className="mt-3 w-full tab:w-auto" onClick={() => set({ socialLinks: [...values.socialLinks, { name: "", url: "" }] })}>
          + {m.addSocial}
        </Button>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-strong bg-paper-raised">
        <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-2 px-4 py-3 tab:flex-row tab:items-center tab:justify-between tab:px-6 desk:px-8">
          <SaveStatus status={dirty && status.kind === "idle" ? { kind: "error", message: messages.common.unsaved } : status} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-walnut px-8 text-ui font-semibold text-on-walnut hover:bg-walnut-dark disabled:opacity-45 tab:w-auto"
          >
            {pending ? messages.common.saving : m.save}
          </button>
        </div>
      </div>
    </form>
  );
}
