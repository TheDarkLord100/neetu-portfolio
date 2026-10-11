import Link from "next/link";
import { ClothCover } from "@/components/cover/cloth-cover";
import { ActionPills } from "@/components/release/action-pills";
import { imageUrl } from "@/lib/data/images";
import type { WorkSummary } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import { formatMonthYear } from "@/lib/i18n/date";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";
import { SaveButton } from "./save-button";

export type WorkRowOptions = {
  /** Cloth thumbnail on the left (catalog). */
  showThumbnail?: boolean;
  /** Save button on the right (catalog). */
  showSave?: boolean;
  /** Date (desktop: after a dotted leader; phone: on the kind line). */
  showDate?: boolean;
  /** Genres in the kind line (desktop) / on their own line (phone). */
  showGenres?: boolean;
  /** "इसमें भी शामिल" / series / book context links. */
  showContext?: boolean;
  /** Leading number column ("भाग 1", "1") for book contents. */
  number?: string;
  /** Heading level for the title (default h3). */
  headingLevel?: "h2" | "h3" | "h4";
};

type Props = WorkRowOptions & {
  work: WorkSummary;
  locale: Locale;
  messages: Pick<Messages, "release" | "a11y" | "kinds" | "work" | "save" | "site">;
  className?: string;
};

const titleLink =
  "font-heading text-h3 text-ink underline decoration-turmeric decoration-2 underline-offset-[6px] hover:decoration-[3px]";
const plainLink = "font-medium text-walnut underline underline-offset-4";

/** One work in a "contents"-style list (DESIGN.md §6.9). */
export function WorkRow({
  work,
  locale,
  messages: m,
  showThumbnail = false,
  showSave = false,
  showDate = true,
  showGenres = true,
  showContext = true,
  number,
  headingLevel = "h3",
  className = "",
}: Props) {
  const Heading = headingLevel;
  const routes = routesFor(locale);
  const href = routes.work(work.slug);
  const date = showDate ? formatMonthYear(work.publishedOn, locale) : null;

  // Kind line: "उपन्यास, धारावाहिक का भाग 2" / "उपन्यास, 42 अध्याय" / "कविता"
  const online = work.releases.find((r) => r.format === "online" && !r.inheritedFrom);
  const kindDetail = work.series
    ? format(m.work.seriesPart, { position: work.series.position })
    : online?.chapterCount
      ? format(m.work.chapters, { count: online.chapterCount })
      : null;
  const kindText = [m.kinds[work.kind], kindDetail].filter(Boolean).join(m.work.listSeparator);
  const genresText =
    showGenres && work.genres.length
      ? format(m.work.genres, { genres: work.genres.map((g) => g.name).join(m.work.listSeparator) })
      : null;

  const hasOwnPrint = work.releases.some((r) => r.format === "print" && !r.inheritedFrom);
  const context = showContext ? (
    <>
      {work.series && (
        <span>
          {m.work.inSeries}{" "}
          <Link href={routes.book(work.series.series.slug)} lang="hi" className={plainLink}>
            {work.series.series.title}
          </Link>
        </span>
      )}
      {work.appearsIn.map((b) => (
        <span key={b.slug}>
          {m.work.appearsIn}{" "}
          <Link href={routes.book(b.slug)} lang="hi" className={plainLink}>
            {b.title}
          </Link>
        </span>
      ))}
      {hasOwnPrint && (
        <span>
          {m.work.alsoAsBook}{" "}
          <Link href={`${routes.books}#neetu-ki-pustaken`} className={plainLink}>
            {m.work.alsoAsBookLink}
          </Link>
        </span>
      )}
    </>
  ) : null;
  const hasContext = showContext && (work.series || work.appearsIn.length > 0 || hasOwnPrint);

  return (
    <article className={`flex gap-4 border-b border-line py-6 desk:gap-6 ${className}`}>
      {number && (
        <span className="shrink-0 pt-1 font-heading text-h3 whitespace-nowrap text-walnut desk:min-w-20">{number}</span>
      )}
      {showThumbnail && (
        <Link href={href} tabIndex={-1} aria-hidden="true" className="shrink-0 pt-1">
          <ClothCover
            kind={work.kind}
            title={work.title}
            kindLabel={m.kinds[work.kind]}
            byline={m.site.name}
            size="row"
            imageUrl={work.coverPath ? imageUrl(work.coverPath) : null}
          />
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <Heading className="min-w-0">
            <Link href={href} lang="hi" className={titleLink}>
              {work.title}
            </Link>
          </Heading>
          {date && (
            <>
              <span aria-hidden="true" className="hidden flex-1 border-b border-dotted border-line-strong desk:block" />
              <span className="hidden shrink-0 text-meta text-ink-soft desk:block">{date}</span>
            </>
          )}
        </div>

        {/* Desktop: "कविता, विषय: प्रेम". Phone: "कविता, सितंबर 2026" then "विषय: प्रेम". */}
        <p className="mt-1 text-meta text-ink-soft">
          <span className="font-semibold">{kindText}</span>
          {date && <span className="desk:hidden">{`${m.work.listSeparator}${date}`}</span>}
          {genresText && <span className="hidden desk:inline">{`${m.work.listSeparator}${genresText}`}</span>}
        </p>
        {genresText && <p className="text-meta text-ink-soft desk:hidden">{genresText}</p>}

        {work.synopsis && (
          <p lang="hi" className="mt-2 text-body text-ink">
            {work.synopsis}
          </p>
        )}

        {hasContext && (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-meta text-ink-soft desk:hidden">{context}</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ActionPills releases={work.releases} workHref={href} messages={m} />
            {hasContext && (
              <span className="hidden flex-wrap gap-x-4 text-meta text-ink-soft desk:flex">{context}</span>
            )}
          </div>
          {showSave && (
            <SaveButton
              slug={work.slug}
              labels={{ ...m.save, accessibleName: format(m.save.accessibleName, { title: work.title }) }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
