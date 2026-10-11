import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const { privacy } = await getMessages();
  return { title: privacy.meta.title, description: privacy.intro };
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
