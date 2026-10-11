import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { WorkForm } from "@/components/admin/work-form";
import { loadAdminStore } from "@/lib/admin/data";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages();

export const metadata: Metadata = { title: m.nav.works };

export default function EditWorkPage({ params }: PageProps<"/admin/works/[id]">) {
  return (
    <div className={`${adminContainer} pt-6 pb-32 desk:pt-8`}>
      <Suspense fallback={null}>
        <Form params={params} />
      </Suspense>
    </div>
  );
}

async function Form({ params }: { params: PageProps<"/admin/works/[id]">["params"] }) {
  const { id } = await params;
  const store = await loadAdminStore();
  const work = store.works.find((w) => w.id === id);
  if (!work) notFound();
  // Remount after each save (updated_at changes) so new release ids are picked up.
  return <WorkForm key={work.updated_at} store={store} workId={work.id} messages={m} />;
}
