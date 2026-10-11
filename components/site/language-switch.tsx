"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/routes";

type Props = {
  /** Languages to offer, in display order. */
  locales: readonly Locale[];
  current: Locale;
  /** Group label for screen readers ("भाषा"). */
  label: string;
  /** Each language in its own script: { hi: "हिंदी", en: "English" }. */
  names: Record<Locale, string>;
  className?: string;
};

/**
 * Hindi / English segmented switch (DESIGN.md §6.21). Links to the same page in
 * the other language. Plain links, so it works without JavaScript after load.
 */
export function LanguageSwitch({ locales, current, label, names, className = "" }: Props) {
  const pathname = usePathname();
  if (locales.length < 2) return null;

  return (
    <nav aria-label={label} className={className}>
      <ul className="inline-flex overflow-hidden rounded-full border border-line-strong bg-paper-raised">
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <a
                href={localizedPath(pathname, locale)}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? "true" : undefined}
                className={[
                  "flex min-h-11 items-center px-4 text-ui font-semibold transition-colors",
                  active ? "bg-walnut text-on-walnut" : "text-ink hover:bg-label-paper",
                ].join(" ")}
              >
                {names[locale]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
