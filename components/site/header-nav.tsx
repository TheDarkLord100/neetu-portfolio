"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeOf, routesFor, sectionOf, type Section } from "@/lib/routes";

type Props = {
  label: string;
  items: Record<Section, string>;
};

const ORDER: Section[] = ["home", "works", "books", "about"];

/**
 * The 4 sections. Phone: a full-width row of equal tabs. Desktop: inline.
 * Client-side only to know the current section (turmeric underline + aria-current).
 */
export function HeaderNav({ label, items }: Props) {
  const pathname = usePathname();
  const current = sectionOf(pathname);
  const r = routesFor(localeOf(pathname));
  const href: Record<Section, string> = { home: r.home, works: r.works, books: r.books, about: r.about };

  return (
    <nav aria-label={label} className="-mx-[var(--gutter)] desk:mx-0">
      <ul className="grid grid-cols-4 desk:flex desk:gap-2">
        {ORDER.map((section) => {
          const active = section === current;
          return (
            <li key={section}>
              <Link
                href={href[section]}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-12 items-center justify-center border-b-[3px] px-2 text-ui transition-colors desk:px-4",
                  active
                    ? "border-turmeric font-semibold text-ink"
                    : "border-transparent font-medium text-ink hover:border-line",
                ].join(" ")}
              >
                {items[section]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
