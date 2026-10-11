// Developer preview of shared components with seed data. Only available in
// `npm run dev`; production builds return "page not found". Headings here are
// developer notes, not site UI, so they are not in the messages files.
import { notFound } from "next/navigation";
import { ClothCover, type CoverSize } from "@/components/cover/cloth-cover";
import { ActionPills } from "@/components/release/action-pills";
import { ReleaseList } from "@/components/release/release-list";
import { LanguageSwitch } from "@/components/site/language-switch";
import { SaveButton } from "@/components/work/save-button";
import { WorkRow } from "@/components/work/work-row";
import { getBook } from "@/lib/data/books";
import { DEFAULT_CATALOG_PARAMS, getCatalog } from "@/lib/data/catalog";
import { getWork } from "@/lib/data/works";
import type { WorkKind } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routes } from "@/lib/routes";

const KINDS: WorkKind[] = ["story", "poem", "novel", "series", "collection", "anthology"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 font-sans text-meta font-semibold tracking-wide text-ink-soft">{title}</h2>
      {children}
    </section>
  );
}

export default async function ComponentsPreview() {
  if (process.env.NODE_ENV === "production") notFound();

  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const [bus, part1, khamoshi, catalog, collection] = await Promise.all([
    getWork("aakhiri-bus"),
    getWork("rishton-ki-dor-bhag-1"),
    getWork("khamoshi"),
    getCatalog({ ...DEFAULT_CATALOG_PARAMS, per: 25 }),
    getBook("dhoop-ke-rang"),
  ]);
  const pick = (slug: string) => catalog.items.find((w) => w.slug === slug);
  const rowSamples = ["aakhiri-bus", "adhuri-kahani", "maa-ki-chitthi", "rishton-ki-dor-bhag-2"]
    .map(pick)
    .filter((w) => w !== undefined);

  return (
    <div className="page-container py-12">
      <h1 className="text-display">Components</h1>
      <p className="mt-2 text-ink-soft">Developer preview (npm run dev only). Seed data.</p>

      <Section title="RELEASE STAMPS — one release (ख़ामोशी)">
        {khamoshi && <ReleaseList releases={khamoshi.releases} messages={m} />}
      </Section>

      <Section title="RELEASE STAMPS — four releases (आख़िरी बस)">
        {bus && <ReleaseList releases={bus.releases} messages={m} />}
      </Section>

      <Section title="RELEASE STAMPS — series part with inherited audiobook (भाग 1)">
        {part1 && <ReleaseList releases={part1.releases} messages={m} />}
      </Section>

      <Section title="RELEASE STAMPS — layout='block' and layout='inline', no detail">
        <div className="grid gap-8 desk:grid-cols-2">
          {bus && <ReleaseList releases={bus.releases.slice(0, 2)} messages={m} layout="block" showDetail={false} />}
          {bus && <ReleaseList releases={bus.releases.slice(0, 2)} messages={m} layout="inline" showDetail={false} />}
        </div>
      </Section>

      <Section title="ACTION PILLS — one release / three verbs / two 'buy' releases (links to work page)">
        <div className="flex flex-col gap-4">
          {khamoshi && <ActionPills releases={khamoshi.releases} workHref={routes.work("khamoshi")} messages={m} />}
          {bus && <ActionPills releases={bus.releases} workHref={routes.work("aakhiri-bus")} messages={m} />}
        </div>
      </Section>

      <Section title="CLOTH COVERS — every kind, size 'card'">
        <div className="flex flex-wrap gap-6">
          {KINDS.map((kind) => (
            <ClothCover
              key={kind}
              kind={kind}
              title={m.kinds[kind]}
              kindLabel={m.kinds[kind]}
              byline={kind === "anthology" ? format(m.cover.editor, { name: "[नाम]" }) : m.site.name}
              size="card"
            />
          ))}
        </div>
      </Section>

      <Section title="CLOTH COVERS — sizes big / card / row / small">
        <div className="flex flex-wrap items-end gap-6">
          {(["big", "card", "row", "small"] as CoverSize[]).map((size) => (
            <ClothCover
              key={size}
              kind="series"
              title="रिश्तों की डोर"
              kindLabel={m.kinds.series}
              byline={m.site.name}
              size={size}
            />
          ))}
        </div>
      </Section>

      <Section title="SAVE BUTTON — compact and large (click to toggle; saved in this browser)">
        <div className="flex flex-wrap items-center gap-4">
          <SaveButton slug="khamoshi" labels={{ ...m.save, accessibleName: format(m.save.accessibleName, { title: "ख़ामोशी" }) }} />
          <SaveButton
            slug="khamoshi"
            size="large"
            labels={{ ...m.save, accessibleName: format(m.save.accessibleName, { title: "ख़ामोशी" }) }}
          />
        </div>
      </Section>

      <Section title="WORK ROWS — catalog style (thumbnail + save)">
        {rowSamples.map((w) => (
          <WorkRow key={w.slug} work={w} locale={locale} messages={m} showThumbnail showSave />
        ))}
      </Section>

      <Section title="WORK ROWS — home 'latest' style (no thumbnail, no save)">
        {rowSamples.slice(0, 2).map((w) => (
          <WorkRow key={w.slug} work={w} locale={locale} messages={m} />
        ))}
      </Section>

      <Section title="WORK ROWS — book contents style (number column, no date)">
        {collection?.contents.map((c) => (
          <WorkRow
            key={c.work.slug}
            work={c.work}
            locale={locale}
            messages={m}
            number={String(c.position)}
            showDate={false}
            showContext={false}
          />
        ))}
      </Section>

      <Section title="LANGUAGE SWITCH — forced to two languages here (hidden on the site until English is enabled)">
        <LanguageSwitch
          locales={["hi", "en"]}
          current={locale}
          label={m.language.label}
          names={{ hi: m.language.hi, en: m.language.en }}
        />
      </Section>
    </div>
  );
}
