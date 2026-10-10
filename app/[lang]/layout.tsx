import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { enabledLocales } from "@/lib/i18n/config";
import { getLocale, getMessages } from "@/lib/i18n/messages";
import "../globals.css";

export async function generateStaticParams() {
  return enabledLocales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages();
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <html lang={await getLocale()} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
