"use client";

import { useEffect, useId, type ComponentProps, type ReactNode } from "react";

// Small building blocks for admin forms (DESIGN.md §10). Plain, readable,
// 44px+ tap targets, labels always visible above the field.

export const inputClass =
  "min-h-13 w-full rounded-control border border-line-strong bg-paper-raised px-4 text-ui text-ink placeholder:text-ink-soft aria-[invalid=true]:border-walnut aria-[invalid=true]:border-2";
export const textareaClass = `${inputClass} py-3 leading-[1.8]`;
export const selectClass = `${inputClass} pr-10`;

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-5 text-ui font-semibold disabled:cursor-default disabled:opacity-45";
export const buttonClass = {
  primary: `${buttonBase} bg-walnut text-on-walnut hover:bg-walnut-dark`,
  secondary: `${buttonBase} border border-line-strong bg-paper-raised text-ink hover:bg-label-paper`,
  quiet: `${buttonBase} px-3 text-walnut underline underline-offset-4 hover:text-walnut-dark`,
  danger: `${buttonBase} border-2 border-walnut bg-paper-raised text-walnut hover:bg-label-paper`,
};

export function Button({ variant = "secondary", className = "", ...props }: ComponentProps<"button"> & { variant?: keyof typeof buttonClass }) {
  return <button type="button" {...props} className={`${buttonClass[variant]} ${className}`} />;
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  /** Renders the control; receives the ids to wire up. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
};

/** Label above, hint and error below, all connected for screen readers. */
export function Field({ label, hint, error, children, className = "" }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-ui font-semibold">
        {label}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {error && (
        <p id={errorId} className="mt-1.5 text-meta font-semibold text-walnut">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1.5 text-meta text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Checkbox row, 48px tall. */
export function Checkbox({ label, hint, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; hint?: string }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" {...props} className="mt-1 size-5.5 shrink-0 accent-walnut" />
      <span>
        <span className="block text-ui">{label}</span>
        {hint && <span className="block text-meta text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}

/** A panel with a heading, used to group form sections. */
export function Section({ title, description, children, actions, id }: { title: string; description?: string; children: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="scroll-mt-6 rounded-panel border border-line bg-paper-raised p-4 tab:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="text-h3">
            {title}
          </h2>
          {description && <p className="mt-1 text-meta text-ink-soft">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Status message under a save button: "Saved" or what went wrong. */
export function SaveStatus({ status }: { status: { kind: "idle" | "saved" | "error"; message?: string } }) {
  return (
    <p role="status" aria-live="polite" className="min-h-6 text-ui">
      {status.kind === "saved" && <span className="font-semibold text-ink">✓ {status.message}</span>}
      {status.kind === "error" && <span className="font-semibold text-walnut">{status.message}</span>}
    </p>
  );
}

/**
 * Asks before leaving the page while there are unsaved changes: on reload or
 * closing the tab (browser prompt), and on clicks on links inside the app.
 */
export function useUnsavedWarning(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link || link.getAttribute("target") === "_blank" || e.defaultPrevented) return;
      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, message]);
}

/** Small pill (status, kind, "Featured"). */
export function Pill({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "strong" | "dashed" }) {
  const tones = {
    plain: "border border-line-strong bg-paper-raised text-ink",
    strong: "bg-walnut text-on-walnut",
    dashed: "border border-dashed border-line-strong text-ink-soft",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 text-meta font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}
