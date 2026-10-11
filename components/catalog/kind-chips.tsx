"use client";

import { CheckIcon } from "@/components/icons";
import { LEAF_KINDS, type LeafKind } from "@/lib/data/types";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  selected: LeafKind[];
  onChange: (kinds: LeafKind[]) => void;
  messages: Messages["catalog"];
};

export const chipClass = (active: boolean) =>
  [
    "inline-flex min-h-[2.875rem] items-center gap-1 rounded-full border px-3.5 text-ui font-medium transition-colors desk:gap-1.5 desk:px-5",
    active
      ? "border-walnut bg-walnut text-on-walnut"
      : "border-line-strong bg-paper-raised text-ink hover:bg-label-paper",
  ].join(" ");

/** Kind chips (DESIGN.md §6.12): toggle buttons; "सभी" clears the kind filter. */
export function KindChips({ selected, onChange, messages: m }: Props) {
  const toggle = (k: LeafKind) =>
    onChange(selected.includes(k) ? selected.filter((s) => s !== k) : [...selected, k]);
  const all = selected.length === 0;

  return (
    <div role="group" aria-label={m.kinds.label} className="flex flex-wrap gap-2 desk:gap-2.5">
      <button type="button" aria-pressed={all} onClick={() => onChange([])} className={chipClass(all)}>
        {all && <CheckIcon size={16} />}
        {m.kinds.all}
      </button>
      {LEAF_KINDS.map((k) => {
        const on = selected.includes(k);
        return (
          <button key={k} type="button" aria-pressed={on} onClick={() => toggle(k)} className={chipClass(on)}>
            {on && <CheckIcon size={16} />}
            {m.kinds[k]}
          </button>
        );
      })}
    </div>
  );
}
