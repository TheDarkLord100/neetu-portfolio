import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ContributorsPanel } from "@/components/book/contributors-panel";
import { bookKindLabel } from "@/components/book/labels";
import { ClothCover, CLOTH_VAR } from "@/components/cover/cloth-cover";
import { ReleaseList } from "@/components/release/release-list";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button-link";
import { WorkRow } from "@/components/work/work-row";
import { booksConfig } from "@/lib/config/books";
import { getBook, getBooks } from "@/lib/data/books";
import { imageUrl } from "@/lib/data/images";
import { isBookKind } from "@/lib/data/map";
import { getWork } from "@/lib/data/works";
import { formatMonthYear, formatYear } from "@/lib/i18n/date";
import { format } from "@/lib/i18n/format";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routes as canonicalRoutes, routesFor } from "@/lib/routes";
import { authorNames, bookJsonLd, fullTitle, pageSeo } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

// Every published series, collection and anthology is prerendered.
export async function generateStaticParams() {
  const { own, anthologies, series } = await getBooks();
  return [...own, ...anthologies, ...series].filter((b) => isBookKind(b.kind)).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/book/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const book = await getBook(slug, locale);
  if (!book) return {};
  return {
    title: book.title,
    description: book.synopsis ?? undefined,
    ...pageSeo({
      path: canonicalRoutes.book(book.slug),
      locale,
      title: fullTitle(m, book.title),
      description: book.synopsis,
      imagePath: book.coverPath,
      type: "book",
    }),
  };
}

// पुस्तक / धारावाहिक (DESIGN.md §7.5): series, collection or anthology.
export default async function BookPage({ params }: PageProps<"/[lang]/book/[slug]">) {
  const { slug } = await params;
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const routes = routesFor(locale);
  const book = await getBook(slug, locale);

  if (!book) {
    // A poem, story or novel slug typed under /book/ goes to its work page.
    if (await getWork(slug, locale)) permanentRedirect(routes.work(slug));
    notFound();
  }

  const b = m.bookPage;
  const kind = book.kind as "series" | "collection" | "anthology";
  const print = book.releases.find((r) => r.format === "print" && !r.inheritedFrom);
  const kindLine = [bookKindLabel(book, m), kind !== "series" && print ? b.printed : null]
    .filter(Boolean)
    .join(m.work.listSeparator);
  const byline = kind === "anthology" && book.editor ? format(m.cover.editor, { name: book.editor }) : m.site.name;

  // Facts list (DESIGN.md §6.15). Collections don't list or count their contents.
  const partDates = book.contents.map((c) => c.work.publishedOn).filter((d): d is string => !!d).sort();
  const year = formatYear(print?.releasedOn ?? book.publishedOn);
  const facts: Array<[string, string | null]> =
    kind === "series"
      ? [
          [b.facts.parts, book.partsCount ? String(book.partsCount) : null],
          [b.facts.firstPart, formatMonthYear(partDates[0] ?? null, locale)],
          [b.facts.latestPart, partDates.length > 1 ? formatMonthYear(partDates[partDates.length - 1], locale) : null],
          [b.facts.genres, book.genres.map((g) => g.name).join(m.work.listSeparator) || null],
        ]
      : kind === "collection"
        ? [
            [b.facts.publisher, print?.publisher ?? null],
            [b.facts.year, year],
            [b.facts.isbn, print?.isbn ?? null],
          ]
        : [
            [b.facts.editor, book.editor],
            [
              b.facts.writers,
              book.contributorsTotal && book.contributorsTotal > 1
                ? format(b.facts.writersValue, { count: book.contributorsTotal - 1 })
                : null,
            ],
            [b.facts.publisher, print?.publisher ?? null],
            [b.facts.year, year],
          ];
  const shownFacts = facts.filter(([, v]) => v);

  const verbs = new Set(book.releases.map((r) => r.verb));
  const releasesHeading =
    kind === "series" && verbs.size === 1 && verbs.has("listen")
      ? b.releasesHeading.seriesListen
      : verbs.size === 1
        ? b.releasesHeading[[...verbs][0]]
        : b.releasesHeading.mixed;

  const showContents = booksConfig.showContents[kind] && book.contents.length > 0;
  const contentsHeading =
    kind === "series"
      ? b.contents.series
      : kind === "anthology"
        ? book.contents.length === 1
          ? b.contents.anthologyOne
          : b.contents.anthologyMany
        : bookKindLabel(book, m) === m.kinds.collectionPoems
          ? b.contents.collectionPoems
          : bookKindLabel(book, m) === m.kinds.collectionStories
            ? b.contents.collectionStories
            : b.contents.collection;
  const firstPart = kind === "series" ? book.contents[0]?.work : undefined;

  return (
    <div className="page-container pt-6 pb-16 desk:pt-10 desk:pb-24">
      <JsonLd data={bookJsonLd(book, routes.book(book.slug), authorNames(locale))} />
      <Breadcrumb
        label={b.breadcrumb}
        items={[{ label: m.nav.books, href: routes.books }, { label: book.title, lang: "hi" }]}
        phoneBack={{ label: b.allBooks, href: routes.books }}
      />

      <div className="mt-6 flex flex-col gap-8 desk:mt-8 desk:flex-row desk:gap-16">
        <div className="self-center desk:self-start">
          <ClothCover
            kind={book.kind}
            title={book.title}
            kindLabel={bookKindLabel(book, m)}
            byline={byline}
            size="big"
            priority
            imageUrl={book.coverPath ? imageUrl(book.coverPath) : null}
          />
        </div>

        <div className="min-w-0 flex-1 desk:max-w-[43rem]">
          <p className="flex items-center gap-2 text-meta font-semibold text-ink-soft">
            <span aria-hidden="true" className="h-4 w-2.5 rounded-[2px]" style={{ backgroundColor: CLOTH_VAR[book.kind] }} />
            {kindLine}
          </p>
          <h1 lang="hi" className="mt-2 text-display">
            {book.title}
          </h1>

          {shownFacts.length > 0 && (
            <dl aria-label={b.facts.label} className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-ui">
              {shownFacts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-meta text-ink-soft">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {book.releases.length > 0 && (
            <section aria-labelledby="book-releases-heading" className="mt-7">
              <h2 id="book-releases-heading" className="font-sans text-ui font-bold">
                {releasesHeading}
              </h2>
              <ReleaseList releases={book.releases} messages={m} ownerKind={book.kind} className="mt-3" />
            </section>
          )}
          {firstPart && (
            <ButtonLink href={routes.work(firstPart.slug)} chevron className="mt-4">
              {b.startReading}
            </ButtonLink>
          )}

          {book.synopsis && (
            <p lang="hi" className="mt-8 font-heading text-lead">
              {book.synopsis}
            </p>
          )}
        </div>
      </div>

      {showContents && (
        <section aria-labelledby="contents-heading" className="mt-14 max-w-[var(--reading-max)] desk:mt-20">
          <h2 id="contents-heading" className="text-h2">
            {contentsHeading}
          </h2>
          {kind === "series" && <p className="mt-1 text-meta text-ink-soft">{b.contents.seriesNote}</p>}
          <div className="mt-5 border-t-2 border-ink">
            {book.contents.map((c, i) => (
              <WorkRow
                key={c.work.slug}
                work={c.work}
                locale={locale}
                messages={m}
                number={
                  kind === "series"
                    ? format(b.contents.part, { position: c.position })
                    : kind === "collection"
                      ? String(i + 1)
                      : undefined
                }
                showContext={false}
              />
            ))}
          </div>
        </section>
      )}

      {kind === "anthology" && (
        <div className="mt-12 max-w-[60rem]">
          <ContributorsPanel
            editor={book.editor}
            featured={book.featuredContributors}
            othersCount={book.otherContributorsCount}
            messages={m}
          />
        </div>
      )}
    </div>
  );
}
