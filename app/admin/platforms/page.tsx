import type { Metadata } from "next";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { PlatformsAndGenres } from "@/components/admin/platforms-editor";
import { loadPlatformsAndGenres } from "@/lib/admin/data";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages();

export const metadata: Metadata = { title: m.platforms.title };

export default function AdminPlatformsPage() {
  return (
    <div className={`${adminContainer} pt-8 pb-16 desk:pt-10`}>
      <h1 className="text-display">{m.platforms.title}</h1>
      <p className="mt-2 text-body text-ink-soft">{m.platforms.intro}</p>
      <Suspense fallback={null}>
        <Editor />
      </Suspense>
    </div>
  );
}

async function Editor() {
  const data = await loadPlatformsAndGenres();
  return <PlatformsAndGenres data={data} messages={m} />;
}
