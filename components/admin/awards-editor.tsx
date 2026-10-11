"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAward, reorderFeaturedAwards, saveAward, setAwardVisible, type AwardInput } from "@/app/admin/awards/actions";
import type { Tables } from "@/lib/database.types";
import type { AdminMessages } from "@/lib/admin/messages";
import type { ActionResult, CommonError } from "@/lib/admin/validate";
import { format } from "@/lib/i18n/format";
import { Button, Checkbox, Field, Pill, SaveStatus, Section, inputClass, useUnsavedWarning } from "./ui";

type Award = Tables<"awards">;
type Status = { kind: "idle" | "saved" | "error"; message?: string };

const smallButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-paper-raised text-ui font-semibold hover:bg-label-paper disabled:opacity-30";

function useAction(messages: AdminMessages) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const run = (action: () => Promise<ActionResult>, onOk?: () => void) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setStatus({ kind: "saved", message: messages.common.saved });
        onOk?.();
        router.refresh();
      } else {
        setStatus({ kind: "error", message: result.message ? format(messages.common.saveFailed, { reason: result.message }) : messages.common.fixErrors });
      }
    });
  return { pending, status, run };
}

/** Awards: featured first (ordered with ↑ ↓), then the rest by year; edit inline, hide or delete. */
export function AwardsEditor({ awards, messages }: { awards: Award[]; messages: AdminMessages }) {
  const m = messages.awards;
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const order = useAction(messages);
  const featured = awards.filter((a) => a.featured).sort((a, b) => a.sort_order - b.sort_order);
  const others = awards.filter((a) => !a.featured).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  const move = (i: number, by: -1 | 1) => {
    const ids = featured.map((a) => a.id);
    [ids[i], ids[i + by]] = [ids[i + by], ids[i]];
    order.run(() => reorderFeaturedAwards(ids));
  };

  const row = (a: Award, reorder?: { index: number; count: number }) => (
    <li key={a.id} className="border-b border-line py-3">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span lang="hi" className={`block text-ui font-semibold ${a.visible ? "" : "text-ink-soft line-through"}`}>
            {a.title_hi}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-meta text-ink-soft">
            {[a.organiser_hi, a.year ?? m.noYear].filter(Boolean).join(" · ")}
            {!a.visible && <Pill tone="dashed">{m.hidden}</Pill>}
          </span>
        </span>
        {reorder && (
          <>
            <button type="button" className={smallButton} disabled={reorder.index === 0 || order.pending} onClick={() => move(reorder.index, -1)} aria-label={`${messages.common.moveUp}: ${a.title_hi}`}>
              ↑
            </button>
            <button
              type="button"
              className={smallButton}
              disabled={reorder.index === reorder.count - 1 || order.pending}
              onClick={() => move(reorder.index, 1)}
              aria-label={`${messages.common.moveDown}: ${a.title_hi}`}
            >
              ↓
            </button>
          </>
        )}
        <Button onClick={() => setEditing(editing === a.id ? null : a.id)} aria-expanded={editing === a.id}>
          {messages.common.edit}
        </Button>
      </div>
      {editing === a.id && <AwardForm award={a} onDone={() => setEditing(null)} messages={messages} />}
    </li>
  );

  return (
    <div className="mt-8 flex flex-col gap-8">
      <div>
        {editing === "new" ? (
          <AwardForm award={null} onDone={() => setEditing(null)} messages={messages} />
        ) : (
          <Button variant="primary" className="w-full tab:w-auto" onClick={() => setEditing("new")}>
            + {m.add}
          </Button>
        )}
      </div>
      <Section title={m.featuredTitle} id="featured">
        {featured.length === 0 ? <p className="text-ui text-ink-soft">{m.noFeatured}</p> : <ol className="border-t border-line">{featured.map((a, i) => row(a, { index: i, count: featured.length }))}</ol>}
        <SaveStatus status={order.status} />
      </Section>
      <Section title={m.othersTitle} id="others">
        {others.length === 0 ? <p className="text-ui text-ink-soft">{m.noOthers}</p> : <ul className="border-t border-line">{others.map((a) => row(a))}</ul>}
      </Section>
    </div>
  );
}

function AwardForm({ award, onDone, messages }: { award: Award | null; onDone: () => void; messages: AdminMessages }) {
  const m = messages.awards;
  const router = useRouter();
  const [initial] = useState<AwardInput>(() => ({
    id: award?.id ?? null,
    titleHi: award?.title_hi ?? "",
    titleEn: award?.title_en ?? "",
    organiserHi: award?.organiser_hi ?? "",
    organiserEn: award?.organiser_en ?? "",
    year: award?.year?.toString() ?? "",
    featured: award?.featured ?? false,
    visible: award?.visible ?? true,
  }));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<string, CommonError>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const action = useAction(messages);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedWarning(dirty && !pending, messages.workForm.leaveWarning);
  const set = (patch: Partial<AwardInput>) => setValues((v) => ({ ...v, ...patch }));
  const err = (k: string) => (errors[k] ? messages.common[errors[k]!] : null);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await saveAward(values);
          if (result.ok) {
            onDone();
            router.refresh();
          } else {
            setErrors(result.errors ?? {});
            setStatus({ kind: "error", message: result.message ? format(messages.common.saveFailed, { reason: result.message }) : messages.common.fixErrors });
          }
        });
      }}
      className="mt-3 rounded-panel border border-line bg-paper p-4"
    >
      {!award && <h2 className="mb-4 text-h3">{m.newAward}</h2>}
      <div className="grid gap-4 tab:grid-cols-2">
        <Field label={m.titleHi} error={err("titleHi")}>
          {({ id, describedBy, invalid }) => (
            <input id={id} lang="hi" aria-describedby={describedBy} aria-invalid={invalid} value={values.titleHi} onChange={(e) => set({ titleHi: e.target.value })} className={inputClass} />
          )}
        </Field>
        <Field label={m.titleEn} hint={messages.common.englishHint}>
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} value={values.titleEn} onChange={(e) => set({ titleEn: e.target.value })} className={inputClass} />}
        </Field>
        <Field label={m.organiserHi}>
          {({ id, describedBy }) => (
            <input id={id} lang="hi" aria-describedby={describedBy} value={values.organiserHi} onChange={(e) => set({ organiserHi: e.target.value })} className={inputClass} />
          )}
        </Field>
        <Field label={m.organiserEn}>
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} value={values.organiserEn} onChange={(e) => set({ organiserEn: e.target.value })} className={inputClass} />}
        </Field>
        <Field label={m.year} error={err("year")}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              inputMode="numeric"
              maxLength={4}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={values.year}
              onChange={(e) => set({ year: e.target.value })}
              className={`${inputClass} tab:max-w-40`}
            />
          )}
        </Field>
        <div className="flex flex-col tab:pt-6">
          <Checkbox label={m.featured} checked={values.featured} onChange={(e) => set({ featured: e.target.checked })} />
          <Checkbox label={m.visible} checked={values.visible} onChange={(e) => set({ visible: e.target.checked })} />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 tab:flex-row tab:flex-wrap tab:items-center">
        <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark disabled:opacity-45">
          {pending ? messages.common.saving : messages.common.save}
        </button>
        <Button onClick={onDone}>{messages.common.cancel}</Button>
        {award && (
          <>
            <Button disabled={action.pending} onClick={() => action.run(() => setAwardVisible(award.id, !award.visible), onDone)}>
              {award.visible ? m.hide : m.show}
            </Button>
            <Button
              variant="danger"
              disabled={action.pending}
              onClick={() => {
                if (window.confirm(format(m.deleteConfirm, { title: award.title_hi }))) action.run(() => deleteAward(award.id), onDone);
              }}
            >
              {messages.common.delete}
            </Button>
          </>
        )}
      </div>
      <SaveStatus status={action.status.kind !== "idle" ? action.status : status} />
    </form>
  );
}
