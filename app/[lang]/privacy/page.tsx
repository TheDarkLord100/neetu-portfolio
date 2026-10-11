import type { Metadata } from "next";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { fullTitle, pageSeo } from "@/lib/seo";
import { routes as canonicalRoutes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  return {
    title: m.privacy.meta.title,
    description: m.privacy.intro,
    ...pageSeo({ path: canonicalRoutes.privacy, locale, title: fullTitle(m, m.privacy.meta.title), description: m.privacy.intro }),
  };
}

// Privacy note (roadmap): saved list stays on the device; voice search uses the
// browser's speech service; release buttons lead to other sites.
export default async function PrivacyPage() {
  const { privacy: p } = await getMessages();
  return (
    <div className="page-container pt-10 pb-16 desk:pt-16 desk:pb-24">
      <div className="max-w-[var(--reading-max)]">
        <h1 className="text-display">{p.heading}</h1>
        <p className="mt-4 text-body">{p.intro}</p>
        {p.sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-h3">{s.heading}</h2>
            <p className="mt-3 text-body">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
