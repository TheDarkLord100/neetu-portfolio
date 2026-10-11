import Link from "next/link";
import { ClothCover } from "@/components/cover/cloth-cover";
import { ReleaseStamp } from "@/components/release/release-stamp";
import { releaseAccessibleName } from "@/components/release/release-text";
import { imageUrl } from "@/lib/data/images";
import type { BookSummary } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";
import { bookDetail, bookHref, bookKindLabel } from "./labels";

type Props = {
  book: BookSummary;
  locale: Locale;
  messages: Pick<Messages, "kinds" | "book" | "work" | "release" | "a11y" | "cover" | "site">;
  /** Show the main release stamp (default true). */
  showStamp?: boolean;
  /** Heading level for the title (default h3). */
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
};

const titleLink =
  "font-heading text-h3 text-ink underline decoration-turmeric decoration-2 underline-offset-[6px] hover:decoration-[3px]";

/**
 * Book card (DESIGN.md §7.1 books strip, §7.4 books page).
 * Desktop: cover, title, detail line, stamp stacked. Phone: thumbnail beside
 * the text, full-width stamp underneath. Cover link is hidden from screen
 * readers (the title is the link).
 */
export function BookCard({ book, locale, messages: m, showStamp = true, headingLevel = "h3", className = "" }: Props) {
  const Heading = headingLevel;
  const href = bookHref(book, locale);
  const kindLabel = bookKindLabel(book, m);
  const byline = book.kind === "anthology" && book.editor ? format(m.cover.editor, { name: book.editor }) : m.site.name;
  const stamp = showStamp ? book.mainRelease : null;

  return (
    <article className={`flex flex-col gap-4 ${className}`}>
      <div className="flex gap-4 desk:flex-col desk:gap-5">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="shrink-0 self-start">
          <ClothCover
            kind={book.kind}
            title={book.title}
            kindLabel={kindLabel}
            byline={byline}
            size="card"
            imageUrl={book.coverPath ? imageUrl(book.coverPath) : null}
          />
        </Link>
        <div className="min-w-0">
          <Heading>
            <Link href={href} lang="hi" className={titleLink}>
              {book.title}
            </Link>
          </Heading>
          <p className="mt-1 text-meta text-ink-soft">{bookDetail(book, m)}</p>
        </div>
      </div>
      {stamp && (
        <ReleaseStamp
          href={stamp.url}
          verb={m.release.verbs[stamp.verb]}
          platformName={stamp.platform.name}
          logoUrl={stamp.platform.logoPath ? imageUrl(stamp.platform.logoPath) : null}
          accessibleName={releaseAccessibleName(stamp, m.release)}
          newWindowLabel={m.a11y.newWindow}
          layout="responsive"
          className="desk:[&>a]:min-w-0"
        />
      )}
    </article>
  );
}
