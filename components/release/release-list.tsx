import { imageUrl } from "@/lib/data/images";
import type { Release, WorkKind } from "@/lib/data/types";
import type { Messages } from "@/lib/i18n/messages";
import { ReleaseStamp, type ReleaseStampProps } from "./release-stamp";
import { releaseAccessibleName, releaseDetail } from "./release-text";

type Props = {
  releases: Release[];
  messages: Pick<Messages, "release" | "a11y">;
  /** Show the detail line for each stamp (default true). */
  showDetail?: boolean;
  layout?: ReleaseStampProps["layout"];
  /** Kind of the work these releases belong to (affects detail wording). */
  ownerKind?: WorkKind;
  /** "column" (default): stacked. "row": side by side on desktop, stacked on phone. */
  direction?: "column" | "row";
  className?: string;
};

/** A stack of release stamps, 12px apart (DESIGN.md §6.6). */
export function ReleaseList({
  releases,
  messages,
  showDetail = true,
  layout,
  direction = "column",
  ownerKind,
  className = "",
}: Props) {
  if (releases.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-3 ${direction === "row" ? "desk:flex-row desk:flex-wrap" : ""} ${className}`}>
      {releases.map((r) => (
        <li key={r.id}>
          <ReleaseStamp
            href={r.url}
            verb={messages.release.verbs[r.verb]}
            platformName={r.platform.name}
            logoUrl={r.platform.logoPath ? imageUrl(r.platform.logoPath) : null}
            detail={showDetail ? releaseDetail(r, messages.release, ownerKind) : null}
            accessibleName={releaseAccessibleName(r, messages.release)}
            newWindowLabel={messages.a11y.newWindow}
            layout={layout}
          />
        </li>
      ))}
    </ul>
  );
}
