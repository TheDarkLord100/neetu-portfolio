import Link from "next/link";
import { bookDetail, bookKindLabel } from "@/components/book/labels";
import { ClothCover } from "@/components/cover/cloth-cover";
import { ChevronRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button-link";
import { imageUrl } from "@/lib/data/images";
import type { BookSummary, SeriesPart, WorkSummary } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";

type M = Pick<Messages, "workPage" | "kinds" | "book" | "work" | "cover" | "site">;

const panel = "rounded-panel border border-line bg-paper-raised p-5 desk:p-7";
const titleLink = "font-heading text-[1.25rem] leading-snug text-ink underline decoration-turmeric decoration-2 underline-offset-[5px]";

/** "<series> के भाग": ordered parts, current one marked, "अगला भाग पढ़ें" (hidden on the last part). */
export function SeriesPartsPanel({
  seriesTitle,
  parts,
  locale,
  messages: m,
}: {
  seriesTitle: string;
  parts: SeriesPart[];
  locale: Locale;
  messages: M;
}) {
  const routes = routesFor(locale);
  const p = m.workPage.parts;
  const currentIndex = parts.findIndex((x) => x.isCurrent);
  const next = currentIndex >= 0 ? parts[currentIndex + 1] : undefined;

  return (
    <section aria-labelledby="parts-heading" className={panel}>
      <h2 id="parts-heading" className="text-h3">
        {format(p.heading, { series: seriesTitle })}
      </h2>
      <ol className="mt-4 border-t border-line">
        {parts.map((part) => {
          const label = format(p.part, { position: part.position });
          return (
            <li key={part.slug} className="border-b border-line">
              {part.isCurrent ? (
                <span aria-current="page" className="flex min-h-14 items-center justify-between gap-3 text-ui font-bold">
                  {label}
                  <span className="text-meta font-normal text-ink-soft">{p.current}</span>
                </span>
              ) : (
                <Link href={routes.work(part.slug)} className="flex min-h-14 items-center justify-between gap-3 text-ui font-medium text-ink hover:text-walnut">
                  {label}
                  <ChevronRightIcon size={18} className="text-ink-soft" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {next && (
        <ButtonLink href={routes.work(next.slug)} variant="primary" chevron fullWidthOnPhone={false} className="mt-5 w-full">
          {p.next}
        </ButtonLink>
      )}
    </section>
  );
}

/** "इसमें भी शामिल": the collections and anthologies containing this work. */
export function AppearsInPanel({ books, locale, messages: m }: { books: BookSummary[]; locale: Locale; messages: M }) {
  if (books.length === 0) return null;
  const routes = routesFor(locale);
  return (
    <section aria-labelledby="appears-heading" className={panel}>
      <h2 id="appears-heading" className="text-h3">
        {m.workPage.appearsIn.heading}
      </h2>
      <ul className="mt-4">
        {books.map((b) => (
          <li key={b.slug} className="flex gap-4 border-t border-line py-4 first:border-t-0 first:pt-0">
            <ClothCover
              kind={b.kind}
              title={b.title}
              kindLabel={bookKindLabel(b, m)}
              byline={m.site.name}
              size="small"
              imageUrl={b.coverPath ? imageUrl(b.coverPath) : null}
            />
            <div>
              <Link href={routes.book(b.slug)} lang="hi" className={titleLink}>
                {b.title}
              </Link>
              <p className="mt-1 text-meta text-ink-soft">{bookDetail(b, m)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "इसी तरह की और रचनाएँ": up to 3 works sharing a genre, then "सभी रचनाएँ देखें". */
export function SimilarWorks({ works, locale, messages: m }: { works: WorkSummary[]; locale: Locale; messages: M }) {
  if (works.length === 0) return null;
  const routes = routesFor(locale);
  return (
    <section aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="text-h3">
        {m.workPage.similar.heading}
      </h2>
      <ul className="mt-4">
        {works.map((w) => (
          <li key={w.slug} className="border-b border-line py-4 first:pt-0">
            <Link href={routes.work(w.slug)} lang="hi" className={titleLink}>
              {w.title}
            </Link>
            <p className="mt-1 text-meta text-ink-soft">
              {[m.kinds[w.kind], ...w.genres.map((g) => g.name)].join(m.work.listSeparator)}
            </p>
          </li>
        ))}
      </ul>
      <ButtonLink href={routes.works} className="mt-5 desk:hidden">
        {m.workPage.similar.viewAll}
      </ButtonLink>
      <Link href={routes.works} className="mt-4 hidden min-h-11 items-center text-ui font-semibold text-walnut underline underline-offset-4 desk:inline-flex">
        {m.workPage.similar.viewAll}
      </Link>
    </section>
  );
}
