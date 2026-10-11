import type { Metadata } from "next";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { AwardsEditor } from "@/components/admin/awards-editor";
import { loadAwards } from "@/lib/admin/data";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages();

export const metadata: Metadata = { title: m.awards.title };

export default function AdminAwardsPage() {
  return (
    <div className={`${adminContainer} pt-8 pb-16 desk:pt-10`}>
      <h1 className="text-display">{m.awards.title}</h1>
      <p className="mt-2 text-body text-ink-soft">{m.awards.intro}</p>
      <Suspense fallback={null}>
        <Editor />
      </Suspense>
    </div>
  );
}

async function Editor() {
  const awards = await loadAwards();
  return <AwardsEditor awards={awards} messages={m} />;
}
