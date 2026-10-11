import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/components/book/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { getBooks } from "@/lib/data/books";
import type { BookSummary } from "@/lib/data/types";
import { formatParts } from "@/lib/i18n/format";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const { booksPage } = await getMessages();
  return { title: booksPage.meta.title, description: booksPage.intro };
}

// Group order, anchors and swatches (DESIGN.md §7.4). Anchors are linked from
// the home page ("धारावाहिक उपन्यास") and work rows ("किताब के रूप में भी").
const GROUPS = [
  { key: "own", id: "neetu-ki-pustaken", swatch: "var(--cloth-collection)" },
  { key: "anthologies", id: "sajha-sankalan", swatch: "var(--cloth-anthology)" },
  { key: "series", id: "dharavahik", swatch: "var(--cloth-series)" },
] as const;

// पुस्तकें (DESIGN.md §7.4).
export default async function BooksPage() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const routes = routesFor(locale);
  const books = await getBooks(locale);
  const p = m.booksPage;
  const groups = GROUPS.map((g) => ({ ...g, books: books[g.key] as BookSummary[], text: p.groups[g.key] })).filter(
    (g) => g.books.length > 0,
  );

  return (
    <div className="page-container pt-10 pb-16 desk:pt-16 desk:pb-24">
      <h1 className="text-display">{p.heading}</h1>
      <p className="mt-3 max-w-[var(--reading-max)] text-body text-ink-soft">{p.intro}</p>

      {groups.length === 0 ? (
        <EmptyState
          className="mt-10"
          heading={p.empty.heading}
          body={p.empty.body}
          action={
            <ButtonLink href={routes.works} variant="primary" fullWidthOnPhone={false}>
              {p.empty.action}
            </ButtonLink>
          }
        />
      ) : (
        <>
          {/* Jump links with counts; empty groups are not shown */}
          <nav aria-label={p.jumpLabel} className="mt-7">
            <ul className="flex flex-wrap gap-2.5">
              {groups.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="inline-flex min-h-[2.875rem] items-center gap-2.5 rounded-full border border-line-strong bg-paper-raised px-4 text-ui font-medium hover:bg-label-paper"
                  >
                    <span aria-hidden="true" className="h-4 w-2.5 rounded-[2px]" style={{ backgroundColor: g.swatch }} />
                    {g.text.heading}
                    <span className="text-meta text-ink-soft">{g.books.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-heading`} className="mt-14 scroll-mt-6 desk:mt-20">
              <div className="flex flex-col gap-1 border-b-2 border-ink pb-3 desk:flex-row desk:items-baseline desk:gap-4">
                <h2 id={`${g.id}-heading`} className="text-h2">
                  {g.text.heading}
                </h2>
                <p className="text-meta text-ink-soft">{g.text.note}</p>
              </div>
              <ul className="mt-6 grid gap-x-9 gap-y-11 desk:mt-8 desk:grid-cols-[repeat(auto-fill,minmax(14.375rem,1fr))]">
                {g.books.map((book) => (
                  <li key={book.slug} className="border-b border-line pb-6 desk:border-b-0 desk:pb-0">
                    <BookCard book={book} locale={locale} messages={m} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="mt-14 text-body text-ink-soft">
            {formatParts(p.footerNote, {
              works: (
                <Link href={routes.works} className="font-semibold text-walnut underline underline-offset-4">
                  {p.worksLink}
                </Link>
              ),
            })}
          </p>
        </>
      )}
    </div>
  );
}
