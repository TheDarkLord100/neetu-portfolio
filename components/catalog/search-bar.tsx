"use client";

import { CloseIcon, MicIcon, SearchIcon } from "@/components/icons";
import type { Messages } from "@/lib/i18n/messages";
import { useVoiceSearch } from "@/lib/voice";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Form action for readers without JavaScript (plain GET to the catalog). */
  action: string;
  /** Speech recognition language. Titles are Hindi, so "hi-IN" on every page. */
  voiceLang?: string;
  messages: Messages["catalog"];
};

const control = "h-14 rounded-control border border-line-strong text-ui";

/**
 * Catalog search (DESIGN.md §6.13): labelled field with magnifier and clear
 * button, plus the बोलें / रोकें voice button and its status line.
 */
export function SearchBar({ value, onChange, action, voiceLang = "hi-IN", messages: m }: Props) {
  const voice = useVoiceSearch({ lang: voiceLang, onText: onChange });
  const listening = voice.status === "listening";
  const message =
    voice.status === "unsupported"
      ? m.voice.unsupported
      : voice.status === "denied"
        ? m.voice.denied
        : voice.status === "noMatch"
          ? m.voice.noMatch
          : null;

  return (
    <form role="search" action={action} method="get" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="catalog-search" className="mb-2 block text-ui font-semibold">
        {m.search.label}
      </label>
      <div className="flex gap-2 desk:max-w-[42.5rem]">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-soft" />
          <input
            id="catalog-search"
            name="q"
            type="search"
            value={value}
            onChange={(e) => {
              voice.reset();
              onChange(e.target.value);
            }}
            placeholder={m.search.placeholder}
            autoComplete="off"
            enterKeyHint="search"
            className={`${control} w-full bg-paper-raised pr-12 pl-12 text-ink placeholder:text-ink-soft [&::-webkit-search-cancel-button]:hidden`}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={m.search.clear}
              className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-control text-ink-soft hover:text-ink"
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={listening ? voice.stop : voice.start}
          aria-label={listening ? m.voice.stopLabel : m.voice.startLabel}
          aria-pressed={listening}
          className={[
            control,
            "inline-flex shrink-0 items-center gap-2 px-4 font-semibold transition-colors",
            listening ? "border-walnut bg-walnut text-on-walnut" : "bg-paper-raised text-ink hover:bg-label-paper",
          ].join(" ")}
        >
          <MicIcon size={18} />
          <span aria-hidden="true">{listening ? m.voice.stop : m.voice.start}</span>
        </button>
        {/* Readers without JavaScript submit the form. */}
        <noscript>
          <button type="submit" className={`${control} bg-walnut px-4 font-semibold text-on-walnut`}>
            {m.search.submit}
          </button>
        </noscript>
      </div>
      <p aria-live="polite" className="mt-2 min-h-0 text-meta text-ink-soft empty:hidden">
        {listening && (
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 rounded-full bg-turmeric" />
            {m.voice.listening}
          </span>
        )}
        {!listening && message}
      </p>
    </form>
  );
}
