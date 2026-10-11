import Link from "next/link";
import type { Release, ReleaseVerb } from "@/lib/data/types";
import type { Messages } from "@/lib/i18n/messages";
import { releaseAccessibleName } from "./release-text";

const VERB_ORDER: ReleaseVerb[] = ["read", "listen", "buy"];

type Props = {
  releases: Release[];
  /** Work page, used when one verb has several releases (e.g. print + Kindle). */
  workHref: string;
  messages: Pick<Messages, "release" | "a11y">;
  className?: string;
};

// ~32px visual pill with a 44px tap area (DESIGN.md §4.7, §6.7).
const pillClass =
  "relative inline-flex h-8 items-center rounded-full border border-line-strong bg-paper-raised px-3 text-[0.9375rem] font-semibold text-walnut " +
  "transition-colors hover:bg-label-paper before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']";

/**
 * Compact release links (DESIGN.md §6.7): one pill per verb, each going straight
 * to the platform. If a verb has several releases, its pill goes to the work page.
 */
export function ActionPills({ releases, workHref, messages, className = "" }: Props) {
  const byVerb = VERB_ORDER.map((verb) => ({ verb, list: releases.filter((r) => r.verb === verb) })).filter(
    (g) => g.list.length > 0,
  );
  if (byVerb.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {byVerb.map(({ verb, list }) => {
        const label = messages.release.verbs[verb];
        if (list.length === 1) {
          const r = list[0];
          return (
            <li key={verb}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${releaseAccessibleName(r, messages.release)} ${messages.a11y.newWindow}`}
                className={pillClass}
              >
                {label}
              </a>
            </li>
          );
        }
        return (
          <li key={verb}>
            <Link href={workHref} className={pillClass}>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
