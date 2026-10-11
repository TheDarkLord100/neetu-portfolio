import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { homeConfig } from "@/lib/config/home";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  messages: Pick<Messages, "home">;
  rows?: typeof homeConfig.browseRows;
  className?: string;
};

/** "क्या पढ़ना चाहेंगे?" panel (DESIGN.md §7.1): rows with a cloth swatch, label and chevron. */
export function BrowsePanel({ messages: m, rows = homeConfig.browseRows, className = "" }: Props) {
  const b = m.home.browse;
  return (
    <section aria-labelledby="browse-heading" className={`rounded-panel border border-line bg-paper-raised p-5 desk:p-7 ${className}`}>
      <h2 id="browse-heading" className="text-h3">
        {b.heading}
      </h2>
      <p className="mt-1 text-meta text-ink-soft">{b.subheading}</p>
      <ul className="mt-5 border-t border-line">
        {rows.map((row) => (
          <li key={row.label} className="border-b border-line">
            <Link href={row.href} className="flex min-h-15 items-center gap-4 text-ui font-medium text-ink hover:text-walnut">
              <span aria-hidden="true" className="h-6 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: row.swatch }} />
              <span className="flex-1">{b[row.label]}</span>
              <ChevronRightIcon size={18} className="text-ink-soft" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
