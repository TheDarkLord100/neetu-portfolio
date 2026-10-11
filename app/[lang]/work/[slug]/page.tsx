import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ClothCover, CLOTH_VAR } from "@/components/cover/cloth-cover";
import { ReleaseList } from "@/components/release/release-list";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShareActions } from "@/components/work/share-actions";
import { AppearsInPanel, SeriesPartsPanel, SimilarWorks } from "@/components/work/side-panels";
import { getBook } from "@/lib/data/books";
import { imageUrl } from "@/lib/data/images";
import type { BookSummary, ReleaseVerb } from "@/lib/data/types";
import { getAllWorks, getWork } from "@/lib/data/works";
import { formatMonthYear } from "@/lib/i18n/date";
import { format, formatParts } from "@/lib/i18n/format";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routes as canonicalRoutes, routesFor } from "@/lib/routes";
import { authorNames, fullTitle, pageSeo, workJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

// Every published work's page is prerendered; new ones render on first visit.
export async function generateStaticParams() {
  return (await getAllWorks()).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const work = await getWork(slug, locale);
  if (!work) return {};
  return {
    title: work.title,
    description: work.synopsis ?? undefined,
    ...pageSeo({
      path: canonicalRoutes.work(work.slug),
      locale,
      title: fullTitle(m, work.title),
      description: work.synopsis,
      imagePath: work.coverPath,
      type: work.kind === "novel" ? "book" : "article",
    }),
  };
}

const VERB_ORDER: ReleaseVerb[] = ["read", "listen", "buy"];

// रचना (DESIGN.md §7.3): poem, story or novel.
export default async function WorkPage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { slug } = await params;
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const routes = routesFor(locale);
  const work = await getWork(slug, locale);

  if (!work) {
    // A book's slug typed under /work/ goes to its book page.
    if (await getBook(slug, locale)) permanentRedirect(routes.book(slug));
    notFound();
  }

  const w = m.workPage;
  const appearsIn = (await Promise.all(work.appearsIn.map((b) => getBook(b.slug, locale)))).filter(
    (b): b is NonNullable<typeof b> => b !== null,
  ) as BookSummary[];

  const kind = work.kind as "story" | "poem" | "novel";
  const hasOwnPrint = work.releases.some((r) => r.format === "print" && !r.inheritedFrom);
  const kindLine = [
    m.kinds[kind],
    work.series ? format(m.work.seriesPart, { position: work.series.position }) : null,
    hasOwnPrint ? w.alsoPrinted : null,
  ]
    .filter(Boolean)
    .join(m.work.listSeparator);
  const date = formatMonthYear(work.publishedOn, locale);
  const verbs = VERB_ORDER.filter((v) => work.releases.some((r) => r.verb === v));
  const releasesHeading = verbs.length ? w.releasesHeading[verbs.join("+") as keyof typeof w.releasesHeading] : null;

  return (
    <div className="page-container pt-6 pb-16 desk:pt-10 desk:pb-24">
      <JsonLd data={workJsonLd(work, routes.work(work.slug), authorNames(locale))} />
      <Breadcrumb
        label={w.breadcrumb}
        items={[
          { label: m.nav.works, href: routes.works },
          { label: w.kindPlural[kind], href: `${routes.works}?kind=${kind}` },
          { label: work.title, lang: "hi" },
        ]}
      />

      {/* Top: cover + header block */}
      <div className="mt-6 flex flex-col gap-8 desk:mt-8 desk:flex-row desk:gap-16">
        <div className="self-center desk:self-start">
          <ClothCover
            kind={work.kind}
            title={work.series ? work.series.series.title : work.title}
            kindLabel={work.series ? format(w.partCover, { position: work.series.position }) : m.kinds[kind]}
            byline={m.site.name}
            size="big"
            priority
            cloth={work.series ? CLOTH_VAR.series : undefined}
            imageUrl={work.coverPath ? imageUrl(work.coverPath) : null}
          />
        </div>

        <div className="min-w-0 flex-1 desk:max-w-[43rem]">
          <p className="flex items-center gap-2 text-meta font-semibold text-ink-soft">
            <span aria-hidden="true" className="h-4 w-2.5 rounded-[2px]" style={{ backgroundColor: CLOTH_VAR[work.kind] }} />
            {kindLine}
          </p>
          <h1 lang="hi" className="mt-2 text-display">
            {work.title}
          </h1>
          {date && <p className="mt-3 text-meta text-ink-soft">{format(w.published, { date })}</p>}

          {work.genres.length > 0 && (
            <ul aria-label={w.genresLabel} className="mt-4 flex flex-wrap gap-2">
              {work.genres.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`${routes.works}?genre=${g.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-paper-raised px-4 text-ui hover:bg-label-paper"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {work.series && (
            <p className="mt-5 rounded-panel border border-line bg-paper-raised px-4 py-3 text-ui">
              {formatParts(w.seriesNote, {
                series: (
                  <Link href={routes.book(work.series.series.slug)} lang="hi" className="font-semibold text-walnut underline underline-offset-4">
                    {work.series.series.title}
                  </Link>
                ),
                position: work.series.position,
                total: work.series.totalParts,
              })}
            </p>
          )}

          {releasesHeading && (
            <section aria-labelledby="releases-heading" className="mt-7">
              <h2 id="releases-heading" className="font-sans text-ui font-bold">
                {releasesHeading}
              </h2>
              <ReleaseList releases={work.releases} messages={m} className="mt-3" />
            </section>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <ShareActions
              slug={work.slug}
              title={work.title}
              path={routes.work(work.slug)}
              messages={{ workPage: w, save: m.save }}
            />
          </div>
        </div>
      </div>

      {/* Below: main column + side column (stacked on phone) */}
      <div className="mt-12 grid gap-12 desk:mt-16 desk:grid-cols-[minmax(0,1fr)_25.5rem] desk:gap-18">
        <div className="min-w-0 max-w-[var(--reading-max)]">
          {work.synopsis && (
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-h2">
                {work.series ? w.about.part : w.about[kind]}
              </h2>
              <p lang="hi" className="mt-4 font-heading text-lead">
                {work.synopsis}
              </p>
            </section>
          )}

          {work.excerpt && (
            <section aria-labelledby="excerpt-heading" className="mt-12">
              <h2 id="excerpt-heading" className="text-h2">
                {w.excerpt.heading}
              </h2>
              <figure className="mt-5 rounded-panel border border-line bg-paper-raised p-6 desk:p-9">
                <span aria-hidden="true" className="block font-heading text-[3rem] leading-none text-turmeric">
                  “
                </span>
                <blockquote lang="hi" className="mt-1 font-heading text-lead whitespace-pre-line">
                  {work.excerpt}
                </blockquote>
                <figcaption className="mt-5 text-meta text-ink-soft">{w.excerpt.caption}</figcaption>
              </figure>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-10">
          {work.series && work.seriesParts.length > 0 && (
            <SeriesPartsPanel seriesTitle={work.series.series.title} parts={work.seriesParts} locale={locale} messages={m} />
          )}
          <AppearsInPanel books={appearsIn} locale={locale} messages={m} />
          <SimilarWorks works={work.similar} locale={locale} messages={m} />
        </aside>
      </div>
    </div>
  );
}
