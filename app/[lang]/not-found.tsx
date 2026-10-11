import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import { routesFor } from "@/lib/routes";

// "Page not found" inside the site design (paper, header, footer).
export default async function NotFound() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const routes = routesFor(locale);
  const n = m.notFound;

  return (
    <div className="page-container py-16 desk:py-24">
      <title>{`${n.meta.title} — ${m.site.name}`}</title>
      <EmptyState
        heading={n.heading}
        body={n.body}
        action={
          <div className="flex w-full flex-col justify-center gap-3 desk:w-auto desk:flex-row">
            <ButtonLink href={routes.home} variant="primary">
              {n.home}
            </ButtonLink>
            <ButtonLink href={routes.works}>{n.works}</ButtonLink>
          </div>
        }
      />
    </div>
  );
}
