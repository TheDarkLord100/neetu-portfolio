"use client";

import { BookmarkIcon } from "@/components/icons";
import { useSavedWorks } from "@/lib/saved";

type Props = {
  slug: string;
  labels: { save: string; saved: string; accessibleName: string };
  /** "compact" (default, lists) or "large" (work page action row, 48px). */
  size?: "compact" | "large";
  className?: string;
};

/**
 * Save (bookmark) toggle (DESIGN.md §6.10). Saved: walnut fill, filled icon,
 * "सहेजी गई", aria-pressed. Renders unsaved on the server, then reads the
 * browser's list after mount; a fixed min-width avoids layout shift.
 */
export function SaveButton({ slug, labels, size = "compact", className = "" }: Props) {
  const { isSaved, toggle } = useSavedWorks();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={labels.accessibleName}
      onClick={() => toggle(slug)}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-control border px-3 text-ui font-semibold transition-colors",
        size === "large" ? "min-h-12 min-w-28" : "min-h-11 min-w-[6.75rem]",
        saved
          ? "border-walnut bg-walnut text-on-walnut hover:bg-walnut-dark"
          : "border-line-strong bg-paper-raised text-walnut hover:bg-label-paper",
        className,
      ].join(" ")}
    >
      <BookmarkIcon filled={saved} size={18} />
      <span aria-hidden="true">{saved ? labels.saved : labels.save}</span>
    </button>
  );
}
