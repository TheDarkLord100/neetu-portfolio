import { getMessages } from "@/lib/i18n/messages";

// Placeholder home page; confirms fonts and messages render.
export default async function Home() {
  const { home } = await getMessages();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl">{home.heading}</h1>
      <p className="mt-4">{home.intro}</p>
    </main>
  );
}
