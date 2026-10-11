import type { MetadataRoute } from "next";
import { loadStore } from "@/lib/data/store";
import { isParentKind } from "@/lib/admin/works";
import { enabledLocales } from "@/lib/i18n/config";
import { localize, routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

// /sitemap.xml: the main pages and every published work and book, in each
// language, each listing its other-language versions. Built from the cached
// works data, so it updates when the admin saves (tag "works").
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await loadStore();
  const pages: Array<{ path: string; lastModified?: string }> = [
    { path: routes.home },
    { path: routes.works },
    { path: routes.books },
    { path: routes.about },
    { path: routes.privacy },
    ...store.works
      .filter((w) => w.status === "published")
      .map((w) => ({ path: isParentKind(w.kind) ? routes.book(w.slug) : routes.work(w.slug), lastModified: w.updated_at })),
  ];

  return pages.flatMap(({ path, lastModified }) => {
    const languages = Object.fromEntries(enabledLocales.map((l) => [l, absoluteUrl(localize(path, l))]));
    return enabledLocales.map((locale) => ({
      url: absoluteUrl(localize(path, locale)),
      lastModified,
      alternates: { languages },
    }));
  });
}
