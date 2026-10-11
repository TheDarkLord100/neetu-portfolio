import type { Metadata } from "next";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { ProfileForm } from "@/components/admin/profile-form";
import { loadAuthorProfile } from "@/lib/admin/data";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages();

export const metadata: Metadata = { title: m.profile.title };

export default function AdminProfilePage() {
  return (
    <div className={`${adminContainer} pt-8 pb-32 desk:pt-10`}>
      <h1 className="text-display">{m.profile.title}</h1>
      <p className="mt-2 text-body text-ink-soft">{m.profile.intro}</p>
      <Suspense fallback={null}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const profile = await loadAuthorProfile();
  return <ProfileForm profile={profile} messages={m} />;
}
