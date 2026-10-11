"use client";

import { useId, useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { format } from "@/lib/i18n/format";
import { Eyebrow } from "./eyebrow";

type Slide = {
  key: string;
  title: string;
  /** Cloth colour for the spine marker. */
  cloth: string;
  /** Server-rendered slide content. */
  content: React.ReactNode;
};

type Props = {
  slides: Slide[];
  labels: {
    region: string;
    eyebrow: string;
    counter: string;
    slideLabel: string;
    previous: string;
    next: string;
  };
};

const navButton =
  "inline-flex min-h-12 items-center gap-2 rounded-control border border-line-strong bg-paper-raised px-4 text-ui font-semibold text-ink transition-colors hover:bg-label-paper";

/**
 * Featured carousel (DESIGN.md §6.20). Tap-only: never moves on its own.
 * All slides are rendered on the server; this only toggles which is visible,
 * so without JavaScript the first slide still shows in full.
 */
export function FeaturedCarousel({ slides, labels }: Props) {
  const [current, setCurrent] = useState(0);
  const id = useId();
  const total = slides.length;
  if (total === 0) return null;

  const go = (step: number) => setCurrent((i) => (i + step + total) % total);
  const counter = format(labels.counter, { current: current + 1, total });

  return (
    <section aria-roledescription="carousel" aria-label={labels.region}>
      {/* Phone: eyebrow + counter above the cover */}
      <div className="mb-4 flex items-center justify-between desk:hidden">
        <Eyebrow text={labels.eyebrow} />
        {total > 1 && <span className="text-ui font-semibold text-ink-soft">{counter}</span>}
      </div>

      <div id={`${id}-slides`} aria-live="polite">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={format(labels.slideLabel, { current: i + 1, total, title: slide.title })}
            hidden={i !== current}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="mt-8 flex items-center gap-4 border-t border-line pt-5 desk:mt-10">
          <span className="hidden text-ui font-semibold text-ink-soft desk:inline">{counter}</span>
          <div aria-hidden="true" className="flex flex-1 items-end gap-3 desk:ml-4">
            {slides.map((s, i) => (
              <span
                key={s.key}
                className={`w-3 rounded-[2px] ${i === current ? "h-7 border-b-[3px] border-turmeric" : "h-5 opacity-70"}`}
                style={{ backgroundColor: s.cloth }}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(-1)} aria-controls={`${id}-slides`} className={navButton}>
            <ChevronRightIcon size={18} className="rotate-180" />
            {labels.previous}
          </button>
          <button type="button" onClick={() => go(1)} aria-controls={`${id}-slides`} className={navButton}>
            {labels.next}
            <ChevronRightIcon size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
