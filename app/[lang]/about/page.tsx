import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon, ChevronDownIcon, MailIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button-link";
import { Ornament } from "@/components/ui/ornament";
import { imageUrl } from "@/lib/data/images";
import { getAuthorProfile, getAwards, getPlatforms } from "@/lib/data/site";
import { format } from "@/lib/i18n/format";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routes as canonicalRoutes, routesFor } from "@/lib/routes";
import { authorNames, fullTitle, pageSeo, personJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [m, profile] = await Promise.all([getMessages(), getAuthorProfile(locale)]);
  return {
    title: m.aboutPage.meta.title,
    description: profile?.intro ?? undefined,
    ...pageSeo({
      path: canonicalRoutes.about,
      locale,
      title: fullTitle(m, m.aboutPage.meta.title),
      description: profile?.intro,
      imagePath: profile?.photoPath,
      type: "profile",
    }),
  };
}

const isEmail = (value: string | null): value is string => !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// परिचय (DESIGN.md §7.6). Sections without data are hidden.
export default async function AboutPage() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const routes = routesFor(locale);
  const [profile, awards, platforms] = await Promise.all([
    getAuthorProfile(locale),
    getAwards(locale),
    getPlatforms(locale),
  ]);
  const a = m.aboutPage;
  const photo = profile?.photoPath ? imageUrl(profile.photoPath) : null;
  const bioParagraphs = (profile?.bio ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const profilePlatforms = platforms.filter((p) => p.profileUrl);
  const email = profile?.email ?? null;
  const hasSide = awards.featured.length > 0 || awards.otherCount > 0 || profilePlatforms.length > 0;

  return (
    <div className="page-container pt-10 pb-16 desk:pt-16 desk:pb-24">
      <JsonLd data={personJsonLd({ names: authorNames(locale), locale, profile, platforms, awards })} />
      {/* Intro: photo as a print, name, tagline, short bio, buttons */}
      <section className="flex flex-col items-center gap-10 desk:flex-row desk:items-start desk:gap-20">
        {photo && (
          <figure className="w-[15.5rem] shrink-0 -rotate-[1.5deg] bg-label-paper p-3 pb-2 shadow-book desk:w-80">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src={photo} alt={a.photoAlt} fill priority sizes="(min-width: 64rem) 320px, 248px" className="object-cover" />
            </div>
            <figcaption className="pt-2 text-center font-heading text-lead">{m.site.name}</figcaption>
          </figure>
        )}
        <div className="w-full desk:max-w-[42rem] desk:pt-4">
          <h1 className="text-display-xl">{m.site.name}</h1>
          {profile?.tagline && <p className="mt-2 font-heading text-lead text-ink-soft">{profile.tagline}</p>}
          {profile?.intro && <p className="mt-6 font-heading text-lead">{profile.intro}</p>}
          <div className="mt-8 flex flex-col gap-3 desk:flex-row">
            <ButtonLink href={routes.works} variant="primary">
              {a.readWorks}
            </ButtonLink>
            <a
              href="#sampark"
              className="inline-flex min-h-13 w-full items-center justify-center rounded-control border border-line-strong bg-paper-raised px-6 text-ui font-semibold text-ink hover:bg-label-paper desk:w-auto"
            >
              {a.contactCta}
            </a>
          </div>
        </div>
      </section>

      <Ornament className="mt-14 desk:mt-20" />

      <div className={`mt-14 grid gap-14 desk:mt-20 ${hasSide ? "desk:grid-cols-[minmax(0,1fr)_26.25rem] desk:gap-18" : ""}`}>
        <div className="min-w-0 max-w-[var(--reading-max)]">
          {bioParagraphs.length > 0 && (
            <section aria-labelledby="journey-heading">
              <h2 id="journey-heading" className="text-h2">
                {a.journey}
              </h2>
              {bioParagraphs.map((p, i) => (
                <p key={i} className="mt-4 text-body">
                  {p}
                </p>
              ))}
            </section>
          )}

          {profile?.quote && (
            <figure className="mt-12">
              <span aria-hidden="true" className="block font-heading text-[3.5rem] leading-none text-turmeric">
                “
              </span>
              <blockquote className="font-heading text-quote">{profile.quote}</blockquote>
              <figcaption className="mt-3 text-meta text-ink-soft">{a.quoteCaption}</figcaption>
            </figure>
          )}
        </div>

        {hasSide && (
          <aside className="flex flex-col gap-12">
            {(awards.featured.length > 0 || awards.otherCount > 0) && (
              <section aria-labelledby="awards-heading" className="rounded-panel border border-line bg-paper-raised p-5 desk:p-7">
                <h2 id="awards-heading" className="text-h3">
                  {a.awards.heading}
                </h2>
                <ul className="mt-4">
                  {awards.featured.map((aw, i) => (
                    <li key={i} className="border-t border-line py-3.5">
                      <p className="text-ui font-semibold">{aw.title}</p>
                      <p className="text-meta text-ink-soft">{[aw.organiser, aw.year].filter(Boolean).join(m.work.listSeparator)}</p>
                    </li>
                  ))}
                </ul>
                {awards.otherCount > 0 && (
                  <details className="group border-t border-line">
                    <summary className="flex min-h-[3.375rem] cursor-pointer list-none items-center justify-between text-ui font-semibold text-walnut [&::-webkit-details-marker]:hidden">
                      {format(a.awards.more, { count: awards.otherCount })}
                      <ChevronDownIcon size={18} className="transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="pb-2">
                      {awards.byYear.map((group) => (
                        <div key={group.year ?? "none"} className="mt-3">
                          <h3 className="font-sans text-meta font-semibold text-ink-soft">{group.year ?? a.awards.noYear}</h3>
                          <ul className="mt-1">
                            {group.awards.map((aw, i) => (
                              <li key={i} className="py-1.5 text-ui">
                                {aw.title}
                                {aw.organiser && <span className="text-ink-soft">{`${m.work.listSeparator}${aw.organiser}`}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </section>
            )}

            {profilePlatforms.length > 0 && (
              <section aria-labelledby="platforms-heading">
                <h2 id="platforms-heading" className="text-h3">
                  {a.platforms.heading}
                </h2>
                <ul className="mt-4 border-t border-line">
                  {profilePlatforms.map((p) => (
                    <li key={p.slug} className="border-b border-line">
                      <a
                        href={p.profileUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-16 items-center gap-4 py-2 hover:text-walnut"
                      >
                        {p.logoPath ? (
                          <Image src={imageUrl(p.logoPath)} alt="" width={36} height={36} className="size-9 shrink-0 object-contain" />
                        ) : (
                          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-[4px] border border-dashed border-line-strong text-meta font-semibold text-ink-soft">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="flex-1">
                          <span className="block text-ui font-semibold">{p.name}</span>
                          {p.description && <span className="block text-meta text-ink-soft">{p.description}</span>}
                        </span>
                        <ArrowUpRightIcon size={18} className="text-walnut" />
                        <span className="sr-only">{m.a11y.newWindow}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        )}
      </div>

      {/* Contact (target of "संपर्क करें") */}
      <section
        id="sampark"
        aria-labelledby="contact-heading"
        className="mt-14 scroll-mt-6 rounded-panel border border-line bg-paper-raised p-6 desk:mt-20 desk:flex desk:items-start desk:justify-between desk:gap-12 desk:p-10"
      >
        <div>
          <h2 id="contact-heading" className="text-h2">
            {a.contact.heading}
          </h2>
          <p className="mt-2 text-body">{a.contact.purpose}</p>
        </div>
        <div className="mt-6 desk:mt-2 desk:w-[31rem]">
          {isEmail(email) ? (
            <a
              href={`mailto:${email}`}
              aria-label={format(a.contact.emailLabel, { email })}
              className="flex min-h-13 w-full items-center justify-center gap-3 rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark"
            >
              <MailIcon size={20} />
              {email}
            </a>
          ) : (
            email && <p className="text-ui font-semibold">{email}</p>
          )}
          {profile && profile.socialLinks.length > 0 && (
            <p className="mt-4 text-meta text-ink-soft">
              {a.contact.social}{" "}
              {profile.socialLinks.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && m.work.listSeparator}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-walnut underline underline-offset-4">
                    {s.name}
                    <span className="sr-only"> {m.a11y.newWindow}</span>
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
