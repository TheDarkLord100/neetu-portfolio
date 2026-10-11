import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  editor: string | null;
  featured: string[];
  othersCount: number;
  messages: Pick<Messages, "bookPage" | "site">;
};

const chip = "inline-flex min-h-11 items-center rounded-full px-4 text-ui";

/**
 * "इस संकलन के लेखक" (DESIGN.md §7.5, §6.12): editor, then contributor chips —
 * her name (walnut), featured co-authors, dashed "और N अन्य लेखक". The chips
 * are labels, not buttons.
 */
export function ContributorsPanel({ editor, featured, othersCount, messages: m }: Props) {
  const c = m.bookPage.contributors;
  return (
    <section aria-labelledby="contributors-heading" className="rounded-panel border border-line bg-paper-raised p-5 desk:p-8">
      <h2 id="contributors-heading" className="text-h3">
        {c.heading}
      </h2>
      {editor && (
        <p className="mt-2 text-ui text-ink-soft">
          {c.editor} <span className="font-semibold text-ink">{editor}</span>
        </p>
      )}
      <ul className="mt-5 flex flex-wrap gap-2.5">
        <li className={`${chip} bg-walnut font-semibold text-on-walnut`}>{m.site.name}</li>
        {featured.map((name) => (
          <li key={name} className={`${chip} border border-line bg-paper`}>
            {name}
          </li>
        ))}
        {othersCount > 0 && (
          <li className={`${chip} border border-dashed border-line-strong`}>{format(c.others, { count: othersCount })}</li>
        )}
      </ul>
      <p className="mt-4 text-meta text-ink-soft">{c.note}</p>
    </section>
  );
}
