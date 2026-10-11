import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { countCatalog } from "@/lib/catalog/rules";
import { getCatalogItems } from "@/lib/data/catalog";
import { getGenres, getPlatforms } from "@/lib/data/site";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { fullTitle, pageSeo } from "@/lib/seo";
import { routes as canonicalRoutes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  return {
    title: m.catalog.meta.title,
    description: m.catalog.intro,
    // Every filter / search combination points to the plain catalog.
    ...pageSeo({ path: canonicalRoutes.works, locale, title: fullTitle(m, m.catalog.meta.title), description: m.catalog.intro }),
  };
}

/**
 * The catalog data and browser. Reads the URL (search params), so it renders
 * per request inside Suspense; the data itself is cached. The browser then
 * filters instantly on the full list.
 */
async function Catalog({ searchParams }: { searchParams: PageProps<"/[lang]/works">["searchParams"] }) {
  // Reading the URL here makes this part render per request on the server, so
  // shared links and readers without JavaScript get the right results. The
  // browser component reads the same URL with useSearchParams.
  await searchParams;
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const [items, genres, platforms] = await Promise.all([
    getCatalogItems(locale),
    getGenres(locale),
    getPlatforms(locale),
  ]);

  return (
    <CatalogBrowser
      items={items}
      counts={countCatalog(items)}
      genres={genres}
      platforms={platforms}
      locale={locale}
      messages={{
        catalog: m.catalog,
        release: m.release,
        a11y: m.a11y,
        kinds: m.kinds,
        work: m.work,
        save: m.save,
        site: m.site,
        book: m.book,
      }}
    />
  );
}

// रचनाएँ (DESIGN.md §7.2). Title and intro are prerendered; the browser streams in.
export default async function WorksPage({ searchParams }: PageProps<"/[lang]/works">) {
  const { catalog } = await getMessages();
  return (
    <div className="page-container pt-10 pb-16 desk:pt-16 desk:pb-24">
      <h1 className="text-display">{catalog.heading}</h1>
      <p className="mt-3 max-w-[var(--reading-max)] text-body text-ink-soft">{catalog.intro}</p>
      <div className="mt-8">
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
