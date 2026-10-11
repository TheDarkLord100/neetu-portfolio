import Link from "next/link";
import { BookCard } from "@/components/book/book-card";
import { CLOTH_VAR } from "@/components/cover/cloth-cover";
import { AboutTeaser } from "@/components/home/about-teaser";
import { BrowsePanel } from "@/components/home/browse-panel";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { FeaturedSlide } from "@/components/home/featured-slide";
import { SavedWorks, type SavedIndexItem } from "@/components/home/saved-works";
import { ButtonLink } from "@/components/ui/button-link";
import { Ornament } from "@/components/ui/ornament";
import { SectionHeading } from "@/components/ui/section-heading";
import { WorkRow } from "@/components/work/work-row";
import { getBooks } from "@/lib/data/books";
import { imageUrl } from "@/lib/data/images";
import { getAuthorProfile } from "@/lib/data/site";
import { getAllWorks, getFeaturedWorks } from "@/lib/data/works";
import { homeConfig } from "@/lib/config/home";
import { formatMonthYear } from "@/lib/i18n/date";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routes } from "@/lib/routes";

// मुखपृष्ठ (DESIGN.md §7.1). Fully pre-rendered; only the carousel and the
// saved-works section run in the browser.
export default async function Home() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const [featured, allWorks, books, profile] = await Promise.all([
    getFeaturedWorks(locale),
    getAllWorks(locale),
    getBooks(locale),
    getAuthorProfile(locale),
  ]);

  const latest = allWorks.slice(0, homeConfig.latestCount);
  const printedBooks = [...books.own, ...books.anthologies]
    .sort((a, b) => (b.publishedOn ?? "").localeCompare(a.publishedOn ?? ""))
    .slice(0, homeConfig.booksCount);
  const savedIndex: SavedIndexItem[] = allWorks.map((w) => ({
    slug: w.slug,
    kind: w.kind,
    title: w.title,
    meta: [m.kinds[w.kind], formatMonthYear(w.publishedOn, locale)].filter(Boolean).join(m.work.listSeparator),
    coverUrl: w.coverPath ? imageUrl(w.coverPath) : null,
    releases: w.releases,
  }));

  return (
    <>
      <div className="page-container pt-8 pb-16 desk:pt-16 desk:pb-20">
        {featured.length > 0 && (
          <FeaturedCarousel
            labels={{ ...m.home.featured }}
            slides={featured.map((item, i) => ({
              key: item.slug,
              title: item.title,
              cloth: CLOTH_VAR[item.kind],
              content: <FeaturedSlide item={item} messages={m} priority={i === 0} />,
            }))}
          />
        )}

        {/* Saved works: browser-only, appears right after the carousel when the reader has saved something. */}
        <div className="mt-10 empty:hidden">
          <SavedWorks
            index={savedIndex}
            limit={homeConfig.savedCount}
            messages={{ home: m.home, release: m.release, a11y: m.a11y, kinds: m.kinds, site: m.site }}
          />
        </div>

        <Ornament className="mt-16 desk:mt-20" />

        <div className="mt-16 grid gap-12 desk:mt-20 desk:grid-cols-[minmax(0,1fr)_23.75rem] desk:gap-18">
          <section aria-labelledby="latest-heading">
            <SectionHeading id="latest-heading" title={m.home.latest.heading} subtitle={m.home.latest.subheading} />
            <div className="mt-6">
              {latest.map((work) => (
                <WorkRow key={work.slug} work={work} locale={locale} messages={m} />
              ))}
            </div>
            <ButtonLink href={routes.works} chevron className="mt-8">
              {m.home.latest.viewAll}
            </ButtonLink>
          </section>
          <BrowsePanel messages={m} className="self-start" />
        </div>
      </div>

      {printedBooks.length > 0 && (
        <div className="border-t border-line">
          <section aria-labelledby="books-heading" className="page-container py-16 desk:py-20">
            <SectionHeading
              id="books-heading"
              title={m.home.books.heading}
              subtitle={m.home.books.subheading}
              action={
                <Link href={routes.books} className="inline-flex min-h-11 items-center text-ui font-semibold text-walnut underline underline-offset-4">
                  {m.home.books.viewAll}
                </Link>
              }
            />
            <div className="mt-10 grid gap-8 border-t border-line pt-8 desk:grid-cols-4 desk:gap-12 desk:border-t-0 desk:pt-0">
              {printedBooks.map((book) => (
                <BookCard key={book.slug} book={book} messages={m} className="border-b border-line pb-8 desk:border-b-0 desk:pb-0" />
              ))}
            </div>
            <ButtonLink href={routes.books} chevron className="mt-8 desk:hidden">
              {m.home.books.viewAll}
            </ButtonLink>
          </section>
        </div>
      )}

      <div className="border-t border-line">
        <div className="page-container py-16 desk:py-20">
          <AboutTeaser profile={profile} messages={m} />
        </div>
      </div>
    </>
  );
}
