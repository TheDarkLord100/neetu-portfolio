import Image from "next/image";

export type ReleaseStampProps = {
  href: string;
  /** Action label: पढ़ें / सुनें / खरीदें. */
  verb: string;
  platformName: string;
  /** Public URL of the platform logo; a lettered placeholder is shown when missing. */
  logoUrl?: string | null;
  /** Plain detail line ("Pratilipi पर, 18 अध्याय"). Omit to show none. */
  detail?: string | null;
  /** Full accessible name, e.g. "पढ़ें — Pratilipi". */
  accessibleName: string;
  /** Screen-reader note for new-window links. */
  newWindowLabel: string;
  /**
   * "responsive" (default): full width on phone, inline (min 250px) with the
   * detail beside it on desktop. "block": always full width, detail below.
   * "inline": always inline, detail below.
   */
  layout?: "responsive" | "block" | "inline";
  className?: string;
};

function PlatformMark({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  if (logoUrl) {
    return <Image src={logoUrl} alt="" width={24} height={24} className="size-6 shrink-0 object-contain" />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-[3px] border border-dashed border-line-strong text-[0.6875rem] font-semibold text-ink-soft"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** Release button (DESIGN.md §6.6): walnut verb block + paper platform side. */
export function ReleaseStamp({
  href,
  verb,
  platformName,
  logoUrl,
  detail,
  accessibleName,
  newWindowLabel,
  layout = "responsive",
  className = "",
}: ReleaseStampProps) {
  const wrapper = {
    responsive: "flex flex-col gap-1.5 desk:flex-row desk:items-center desk:gap-5",
    block: "flex flex-col gap-1.5",
    inline: "flex flex-col items-start gap-1.5",
  }[layout];
  const width = {
    responsive: "w-full desk:w-auto desk:min-w-[15.625rem]",
    block: "w-full",
    inline: "w-auto min-w-[15.625rem]",
  }[layout];

  return (
    <div className={`${wrapper} ${className}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${accessibleName} ${newWindowLabel}`}
        className={`group flex min-h-14 overflow-hidden rounded-control border border-line-strong ${width}`}
      >
        <span className="flex min-w-24 items-center justify-center bg-walnut px-5 text-[1.25rem] font-bold text-on-walnut transition-colors group-hover:bg-walnut-dark group-active:bg-walnut-dark">
          {verb}
        </span>
        <span className="flex flex-1 items-center gap-3 bg-paper-raised px-4 text-ui font-medium text-ink">
          <PlatformMark name={platformName} logoUrl={logoUrl} />
          {platformName}
        </span>
      </a>
      {detail ? <p className="text-meta text-ink-soft">{detail}</p> : null}
    </div>
  );
}
