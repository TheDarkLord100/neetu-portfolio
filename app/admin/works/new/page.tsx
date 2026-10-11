import type { Metadata } from "next";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { WorkForm } from "@/components/admin/work-form";
import { loadAdminStore } from "@/lib/admin/data";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages();

export const metadata: Metadata = { title: m.workForm.newTitle };

export default function NewWorkPage() {
  return (
    <div className={`${adminContainer} pt-6 pb-32 desk:pt-8`}>
      <Suspense fallback={null}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const store = await loadAdminStore();
  return <WorkForm store={store} workId={null} messages={m} />;
}
