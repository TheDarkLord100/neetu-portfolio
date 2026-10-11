"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { SaveButton } from "./save-button";

type Props = {
  slug: string;
  title: string;
  /** Path of this page; the full address is read in the browser (no domain yet). */
  path: string;
  messages: Pick<Messages, "workPage" | "save">;
};

// The page's full address, read after mount (the server only knows the path).
const subscribeNoop = () => () => {};
const useHref = (fallback: string) =>
  useSyncExternalStore(subscribeNoop, () => window.location.href, () => fallback);

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure contexts.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const button =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-line-strong bg-paper-raised px-4 text-ui font-semibold text-ink transition-colors hover:bg-label-paper";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

/**
 * Action row (DESIGN.md §7.3): save, WhatsApp, copy link. Copy shows
 * "लिंक कॉपी हो गया" for 2.5 s, announced via aria-live.
 * Phone: save + WhatsApp side by side, copy full width below.
 */
export function ShareActions({ slug, title, path, messages: m }: Props) {
  const s = m.workPage.share;
  const href = useHref(path);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(format(s.whatsappText, { title, url: href }))}`;

  const onCopy = async () => {
    if (await copyText(window.location.href)) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div role="group" aria-label={s.label} className="grid grid-cols-2 gap-2 desk:flex desk:flex-wrap desk:gap-3">
      <SaveButton
        slug={slug}
        size="large"
        className="w-full desk:w-auto"
        labels={{ ...m.save, accessibleName: format(m.save.accessibleName, { title }) }}
      />
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={s.whatsapp} className={button}>
        <WhatsAppIcon />
        <span className="hidden tab:inline">{s.whatsapp}</span>
        <span className="tab:hidden">{s.whatsappShort}</span>
      </a>
      <button type="button" onClick={onCopy} className={`${button} col-span-2`}>
        <LinkIcon />
        <span aria-live="polite">{copied ? s.copied : s.copy}</span>
      </button>
    </div>
  );
}
