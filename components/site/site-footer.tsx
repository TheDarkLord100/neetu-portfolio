import { cacheLife } from "next/cache";
import Link from "next/link";
import { getAuthorProfile, getPlatforms } from "@/lib/data/site";
import { format } from "@/lib/i18n/format";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";

/** Year of the build (keeps the footer static; updates on every deploy). */
async function buildYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

const linkClass = "inline-flex min-h-11 items-center underline underline-offset-4 hover:text-on-walnut";

function ExternalLink({ href, children, newWindow }: { href: string; children: React.ReactNode; newWindow: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <span className="sr-only"> {newWindow}</span>
    </a>
  );
}

/** Same footer on every page (DESIGN.md §6.2). */
export async function SiteFooter() {
  const locale = await getLocale();
  const [{ site, nav, footer, a11y, privacy }, profile, platforms, year] = await Promise.all([
    getMessages(),
    getAuthorProfile(locale),
    getPlatforms(locale),
    buildYear(),
  ]);
  const routes = routesFor(locale);

  const email = profile?.email ?? null;
  const profileLinks = platforms.filter((p) => p.profileUrl);
  const navLinks = [
    { href: routes.home, label: nav.home },
    { href: routes.works, label: nav.works },
    { href: routes.books, label: nav.books },
    { href: routes.about, label: nav.about },
  ];

  return (
    <footer className="bg-ink text-on-walnut">
      <div className="page-container py-12 desk:py-16">
        <div className="grid gap-10 desk:grid-cols-[1fr_auto_minmax(16rem,22rem)] desk:gap-24">
          <div>
            <p className="font-heading text-brand">{site.name}</p>
            <p className="mt-1 text-meta text-footer-text-soft">{site.tagline}</p>
          </div>

          <nav aria-label={footer.navLabel}>
            <ul className="grid grid-cols-2 gap-x-8 desk:grid-cols-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-sans text-ui font-semibold">{footer.contact}</h2>
            <ul className="mt-2">
              {email && (
                <li className="text-footer-text-soft">
                  {email.includes("@") ? (
                    <a href={`mailto:${email}`} className={linkClass}>
                      {email}
                    </a>
                  ) : (
                    <span className="inline-flex min-h-11 items-center">{email}</span>
                  )}
                </li>
              )}
              {profileLinks.map((p) => (
                <li key={p.slug}>
                  <ExternalLink href={p.profileUrl!} newWindow={a11y.newWindow}>
                    {format(footer.platformProfile, { platform: p.name })}
                  </ExternalLink>
                </li>
              ))}
              {profile?.socialLinks.map((s) => (
                <li key={s.url}>
                  <ExternalLink href={s.url} newWindow={a11y.newWindow}>
                    {s.name}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-footer-text-soft/25 pt-6 text-meta text-footer-text-soft desk:flex-row desk:items-center desk:justify-between">
          <p>{format(footer.copyright, { year })}</p>
          <Link href={routes.privacy} className={linkClass}>
            {privacy.link}
          </Link>
        </div>
      </div>
    </footer>
  );
}
