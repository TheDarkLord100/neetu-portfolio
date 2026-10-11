import Link from "next/link";
import { bookHref, bookKindLabel } from "@/components/book/labels";
import { ClothCover } from "@/components/cover/cloth-cover";
import { ReleaseList } from "@/components/release/release-list";
import { imageUrl } from "@/lib/data/images";
import type { BookSummary, WorkSummary } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { Eyebrow } from "./eyebrow";

type Props = {
  item: WorkSummary | BookSummary;
  locale: Locale;
  messages: Messages;
  /** Load the cover eagerly (first slide). */
  priority?: boolean;
};

const isBook = (item: WorkSummary | BookSummary): item is BookSummary => "partsCount" in item;

/** One featured slide: big cover + eyebrow, title, kind line, synopsis, stamps, link. */
export function FeaturedSlide({ item, locale, messages: m, priority = false }: Props) {
  const book = isBook(item) ? item : null;
  const href = bookHref(item, locale);
  const kindLabel = book ? bookKindLabel(book, m) : m.kinds[item.kind];
  const byline = book?.kind === "anthology" && book.editor ? format(m.cover.editor, { name: book.editor }) : m.site.name;

  // "धारावाहिक उपन्यास, 2 भागों में" / "उपन्यास, 42 अध्याय" / "कविता संग्रह"
  const online = item.releases.find((r) => r.format === "online" && !r.inheritedFrom);
  const kindDetail =
    book?.kind === "series" && book.partsCount > 0
      ? format(m.home.featured.parts, { count: book.partsCount })
      : !book && online?.chapterCount
        ? format(m.work.chapters, { count: online.chapterCount })
        : null;
  const kindLine = [kindLabel, kindDetail].filter(Boolean).join(m.work.listSeparator);
  const moreLabel = book?.kind === "series" ? m.home.featured.seeParts : m.home.featured.seeMore;
  // A series with no release of its own to read gets part 1's "पढ़ें" first (DESIGN.md §7.4).
  const slideReleases =
    book?.mainRelease && !item.releases.some((r) => r.id === book.mainRelease!.id)
      ? [book.mainRelease, ...item.releases]
      : item.releases;

  return (
    <div className="flex flex-col items-center gap-6 desk:flex-row desk:items-start desk:gap-18">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="shrink-0">
        <ClothCover
          kind={item.kind}
          title={item.title}
          kindLabel={kindLabel}
          byline={byline}
          size="big"
          priority={priority}
          imageUrl={item.coverPath ? imageUrl(item.coverPath) : null}
        />
      </Link>

      <div className="w-full min-w-0 desk:max-w-[42rem] desk:pt-2">
        <Eyebrow text={m.home.featured.eyebrow} className="mb-3 hidden desk:flex" />
        <h2 lang="hi" className="text-display">
          <Link href={href} className="hover:underline hover:decoration-turmeric hover:decoration-2 hover:underline-offset-8">
            {item.title}
          </Link>
        </h2>
        <p className="mt-3 text-meta text-ink-soft">{kindLine}</p>
        {item.synopsis && (
          <p lang="hi" className="mt-5 font-heading text-lead text-ink">
            {item.synopsis}
          </p>
        )}

        <ReleaseList
          releases={slideReleases}
          messages={m}
          showDetail={false}
          direction="row"
          className="mt-7"
        />
        <p className="mt-4">
          <Link href={href} className="inline-flex min-h-11 items-center text-ui font-semibold text-walnut underline underline-offset-4">
            {moreLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
