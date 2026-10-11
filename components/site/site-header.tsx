import Link from "next/link";
import { enabledLocales } from "@/lib/i18n/config";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";
import { HeaderNav } from "./header-nav";
import { LanguageSwitch } from "./language-switch";

/**
 * Site header (DESIGN.md §6.1). No search here: it lives on the रचनाएँ page.
 * Phone: name, then the 4-tab row on the full-width hairline.
 * Desktop: name left, nav on the right.
 * The language switch sits far right (phone: beside the name); it renders
 * nothing until more than one language is enabled.
 */
export async function SiteHeader() {
  const [{ site, nav, language }, locale] = await Promise.all([getMessages(), getLocale()]);
  // Only reserve space for the switch when there is more than one language.
  const showLanguages = enabledLocales.length > 1;
  const languageSwitch = (
    <LanguageSwitch
      locales={enabledLocales}
      current={locale}
      label={language.label}
      names={{ hi: language.hi, en: language.en }}
    />
  );
  const navItems = { home: nav.home, works: nav.works, books: nav.books, about: nav.about };

  return (
    <header className="border-b border-line">
      <div className="page-container flex flex-col pt-4 desk:flex-row desk:items-center desk:gap-10 desk:py-5">
        <div className="flex items-start justify-between gap-4 pb-3 desk:pb-0">
          <div>
            <Link href={routesFor(locale).home} className="inline-block font-heading text-brand text-ink">
              {site.name}
            </Link>
            <p className="text-meta text-ink-soft">{site.tagline}</p>
          </div>
          {showLanguages && <div className="desk:hidden">{languageSwitch}</div>}
        </div>
        <div className="desk:ml-auto">
          <HeaderNav label={nav.label} items={navItems} />
        </div>
        {showLanguages && <div className="hidden desk:block">{languageSwitch}</div>}
      </div>
    </header>
  );
}
