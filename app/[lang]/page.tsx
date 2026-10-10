import { getMessages } from "@/lib/i18n/messages";

// Placeholder home page until the "Home page" roadmap item.
export default async function Home() {
  const { home } = await getMessages();
  return (
    <div className="page-container py-16 desk:py-24">
      <h1 className="text-display">{home.heading}</h1>
      <p className="mt-4 max-w-[var(--reading-max)]">{home.intro}</p>
    </div>
  );
}
