import Image from "next/image";
import type { WorkKind } from "@/lib/data/types";

export type CoverSize = "big" | "card" | "row" | "small";

/** Cloth colour per kind (DESIGN.md §2). Override with `cloth` (e.g. a series part's big cover). */
export const CLOTH_VAR: Record<WorkKind, string> = {
  story: "var(--cloth-story)",
  poem: "var(--cloth-poem)",
  novel: "var(--cloth-novel)",
  series: "var(--cloth-series)",
  collection: "var(--cloth-collection)",
  anthology: "var(--cloth-anthology)",
};

// Widths per size (DESIGN.md §6.8). 2:3 aspect ratio throughout.
const SIZE_CLASS: Record<CoverSize, string> = {
  big: "w-[12.5rem] desk:w-[18.75rem]", // 200 / 300
  card: "w-24 desk:w-[11.25rem]", // 96 / 180
  row: "w-11 desk:w-16", // 44 / 64
  small: "w-8", // 32
};

// Image `sizes` hints so next/image picks a sensible file.
const SIZES_ATTR: Record<CoverSize, string> = {
  big: "(min-width: 64rem) 300px, 200px",
  card: "(min-width: 64rem) 180px, 96px",
  row: "64px",
  small: "32px",
};

type Props = {
  kind: WorkKind;
  title: string;
  /** Kind shown on the label ("कहानी", "कविता संग्रह"). */
  kindLabel: string;
  /** Bottom byline: her name, or "संपादक: …" for anthologies. */
  byline: string;
  size: CoverSize;
  /** Public URL of an uploaded cover; the cloth fallback is used when missing. */
  imageUrl?: string | null;
  /** Override the cloth colour (any CSS colour or var). */
  cloth?: string;
  /** Load eagerly (above-the-fold big covers). */
  priority?: boolean;
  className?: string;
};

/**
 * Book-object cover (DESIGN.md §6.8): an uploaded image, or the cloth fallback
 * with spine, inner rule and pasted title label. Row and small sizes show only
 * the label shape and are hidden from screen readers.
 */
export function ClothCover({
  kind,
  title,
  kindLabel,
  byline,
  size,
  imageUrl,
  cloth,
  priority = false,
  className = "",
}: Props) {
  const textual = size === "big" || size === "card";
  const frame = `relative aspect-[2/3] shrink-0 overflow-hidden rounded-[2px_6px_6px_2px] shadow-book ${SIZE_CLASS[size]} ${className}`;

  if (imageUrl) {
    return (
      <div className={frame} aria-hidden={textual ? undefined : true}>
        <Image
          src={imageUrl}
          alt={textual ? title : ""}
          fill
          sizes={SIZES_ATTR[size]}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const spine = size === "small" || size === "row" ? "4px" : "10px";
  return (
    <div
      className={frame}
      aria-hidden={textual ? undefined : true}
      style={{
        backgroundColor: cloth ?? CLOTH_VAR[kind],
        backgroundImage: `linear-gradient(to right, rgb(0 0 0 / 0.28) 0 ${spine}, rgb(0 0 0 / 0.1) ${spine} calc(${spine} + 2px), transparent calc(${spine} + 2px))`,
      }}
    >
      {textual && (
        <span className="absolute inset-[6%] rounded-[1px] border border-label-paper/35" aria-hidden="true" />
      )}

      {/* Pasted label */}
      <div
        className={[
          "absolute inset-x-[8%] top-1/2 flex -translate-y-1/2 flex-col items-center justify-center bg-label-paper text-center text-ink",
          textual ? "min-h-[30%] px-[8%] py-[8%]" : "h-[18%]",
        ].join(" ")}
      >
        {textual && (
          <>
            <span
              className={`font-heading leading-snug ${size === "big" ? "text-[1.375rem] desk:text-[1.75rem]" : "text-[0.8125rem] desk:text-[1.125rem]"}`}
            >
              {title}
            </span>
            <span className="my-[6%] h-px w-1/4 bg-ink-soft/60" aria-hidden="true" />
            <span className={`text-ink-soft ${size === "big" ? "text-meta" : "text-[0.625rem] desk:text-[0.8125rem]"}`}>
              {kindLabel}
            </span>
          </>
        )}
      </div>

      {textual && (
        <span
          className={`absolute inset-x-0 bottom-[7%] text-center text-label-paper ${size === "big" ? "text-meta" : "hidden desk:block desk:text-[0.875rem]"}`}
        >
          {byline}
        </span>
      )}
      {textual && <span className="sr-only">{`${title}, ${kindLabel}, ${byline}`}</span>}
    </div>
  );
}
