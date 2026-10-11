import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { fontVariables } from "@/lib/fonts";
import { enabledLocales } from "@/lib/i18n/config";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import "../globals.css";

export async function generateStaticParams() {
  return enabledLocales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages();
  return { title: { default: meta.title, template: meta.titleTemplate }, description: meta.description };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, { a11y }] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-walnut focus:px-4 focus:py-3 focus:text-ui focus:font-semibold focus:text-on-walnut"
        >
          {a11y.skipToContent}
        </a>
        <div className="paper flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
