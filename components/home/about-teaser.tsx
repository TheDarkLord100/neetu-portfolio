import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { imageUrl } from "@/lib/data/images";
import type { AuthorProfile } from "@/lib/data/site";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import { routesFor } from "@/lib/routes";

type Props = {
  profile: AuthorProfile | null;
  locale: Locale;
  messages: Pick<Messages, "home">;
};

/** About teaser (DESIGN.md §7.1): photo (only when uploaded), heading, short intro, link to About. */
export function AboutTeaser({ profile, locale, messages: m }: Props) {
  const a = m.home.about;
  const photo = profile?.photoPath ? imageUrl(profile.photoPath) : null;

  return (
    <section aria-labelledby="about-teaser-heading" className="flex flex-col gap-8 desk:flex-row desk:items-start desk:gap-14">
      {photo && (
        <div className="relative aspect-[4/5] w-[13.75rem] shrink-0 overflow-hidden rounded-[2px] shadow-book">
          <Image src={photo} alt={a.photoAlt} fill sizes="220px" className="object-cover" />
        </div>
      )}
      <div className="max-w-[var(--reading-max)]">
        <h2 id="about-teaser-heading" className="text-h2">
          {a.heading}
        </h2>
        {profile?.intro && <p className="mt-4 text-body">{profile.intro}</p>}
        <ButtonLink href={routesFor(locale).about} chevron className="mt-6">
          {a.more}
        </ButtonLink>
      </div>
    </section>
  );
}
