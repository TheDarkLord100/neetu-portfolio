import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

export type Crumb = { label: string; href?: string; lang?: string };

type Props = {
  items: Crumb[];
  label: string;
  /** Phone hides the last item (the current page) — DESIGN.md §6.3. */
  hideLastOnPhone?: boolean;
  /** Phone shows only a "‹ back" link to this item instead of the trail. */
  phoneBack?: Crumb;
};

/** Breadcrumb (DESIGN.md §6.3): walnut links, current page plain, › separators, 44px links. */
export function Breadcrumb({ items, label, hideLastOnPhone = true, phoneBack }: Props) {
  return (
    <nav aria-label={label}>
      {phoneBack?.href && (
        <Link
          href={phoneBack.href}
          className="inline-flex min-h-11 items-center gap-1 text-meta font-medium text-walnut underline underline-offset-4 desk:hidden"
        >
          <ChevronRightIcon size={16} className="rotate-180" />
          {phoneBack.label}
        </Link>
      )}
      <ol className={`flex-wrap items-center gap-x-2 text-meta ${phoneBack ? "hidden desk:flex" : "flex"}`}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={`flex items-center gap-2 ${last && hideLastOnPhone ? "hidden desk:flex" : ""}`}>
              {item.href && !last ? (
                <Link href={item.href} lang={item.lang} className="inline-flex min-h-11 items-center font-medium text-walnut underline underline-offset-4">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} lang={item.lang} className="text-ink">
                  {item.label}
                </span>
              )}
              {!last && (
                <span
                  aria-hidden="true"
                  className={`text-ink-soft ${hideLastOnPhone && i === items.length - 2 ? "hidden desk:inline" : ""}`}
                >
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
