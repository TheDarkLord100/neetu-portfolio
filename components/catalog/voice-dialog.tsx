"use client";

import { useEffect, useRef, type RefObject } from "react";
import { CloseIcon, MicIcon } from "@/components/icons";
import type { Messages } from "@/lib/i18n/messages";
import type { VoiceStatus } from "@/lib/voice";

type Props = {
  status: VoiceStatus;
  transcript: string;
  onStop: () => void;
  onRetry: () => void;
  onClose: () => void;
  /** Gets focus back when the window closes (some browsers don't focus a tapped button). */
  returnFocusTo: RefObject<HTMLButtonElement | null>;
  messages: Messages["catalog"]["voice"];
};

const button = "inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-control px-6 text-ui font-semibold";

/**
 * Voice listening window (DESIGN.md §6.22). Native modal <dialog>: a bottom
 * sheet on phones, centred on desktop. Open while the microphone is starting,
 * listening, or showing an error; Esc, ✕ and a tap outside all close it.
 */
export function VoiceDialog({ status, transcript, onStop, onRetry, onClose, returnFocusTo, messages: m }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = status === "starting" || status === "listening" || status === "denied" || status === "noMatch";
  const active = status === "starting" || status === "listening";
  const error = status === "denied" ? m.denied : status === "noMatch" ? m.noMatch : null;

  const wasOpen = useRef(false);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open && wasOpen.current) returnFocusTo.current?.focus();
    wasOpen.current = open;
  }, [open, returnFocusTo]);

  // Focus the main button when the window opens or switches to the error buttons.
  useEffect(() => {
    if (open) ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [open, active]);

  const heading = status === "starting" ? m.startingHeading : active ? m.listeningHeading : error ? m.errorHeading : null;
  const hint = status === "starting" ? m.startingHint : status === "listening" ? m.listeningHint : null;

  return (
    <dialog
      ref={ref}
      aria-labelledby="voice-dialog-heading"
      // Esc: the browser closes the dialog; keep our state in step.
      onClose={() => open && onClose()}
      // A tap on the backdrop lands on the <dialog> element itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-panel border border-line-strong bg-paper-raised p-0 text-ink backdrop:bg-ink/55 tab:m-auto tab:max-w-[30rem] tab:rounded-panel"
    >
      <div className="relative px-5 pt-5 pb-6 text-center tab:px-8 tab:pt-6 tab:pb-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={m.close}
          className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-control text-ink-soft hover:text-ink"
        >
          <CloseIcon size={20} />
        </button>

        {/* Mic: turmeric circle; a soft ring pulses only while listening (still when reduced motion is on). */}
        <div className="relative mx-auto mt-4 flex size-24 items-center justify-center">
          {status === "listening" && (
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-turmeric/35 motion-safe:animate-[voice-pulse_1.6s_ease-out_infinite]" />
          )}
          <span
            aria-hidden="true"
            className={[
              "relative flex size-20 items-center justify-center rounded-full",
              error ? "border-2 border-line-strong bg-label-paper text-ink-soft" : "",
              status === "starting" ? "border-2 border-dashed border-turmeric bg-label-paper text-turmeric" : "",
              status === "listening" ? "bg-turmeric text-on-walnut" : "",
            ].join(" ")}
          >
            <MicIcon size={34} />
          </span>
        </div>

        <div aria-live="polite">
          <h2 id="voice-dialog-heading" className="mt-5 text-h3">
            {heading}
          </h2>
          {hint && <p className="mt-2 text-body text-ink-soft">{hint}</p>}
          {error && <p className="mt-2 text-body">{error}</p>}
        </div>

        {active && transcript && (
          <p className="mt-5 rounded-control border border-line bg-paper px-4 py-3">
            <span className="block text-meta text-ink-soft">{m.heard}</span>
            <span lang="hi" className="block font-heading text-lead">
              {transcript}
            </span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {/* One button while active (keeps focus when "starting" turns into "listening"). */}
          {active && (
            <button
              type="button"
              data-autofocus
              onClick={status === "listening" ? onStop : onClose}
              className={`${button} ${status === "listening" ? "bg-walnut text-on-walnut hover:bg-walnut-dark" : "border border-line-strong bg-paper-raised hover:bg-label-paper"}`}
            >
              {status === "listening" ? m.stop : m.cancel}
            </button>
          )}
          {error && (
            <>
              <button type="button" data-autofocus onClick={onRetry} className={`${button} bg-walnut text-on-walnut hover:bg-walnut-dark`}>
                <MicIcon size={18} />
                {m.retry}
              </button>
              <button type="button" onClick={onClose} className={`${button} border border-line-strong bg-paper-raised hover:bg-label-paper`}>
                {m.close}
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
