import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import type hi from "@/messages/hi.json";
import { isEnabledLocale, type Locale } from "./config";

// hi.json is the source of truth for keys; every other locale must match its shape.
export type Messages = typeof hi;

const loaders: Record<Locale, () => Promise<Messages>> = {
  hi: () => import("@/messages/hi.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
};

// Server Components only. Reads the current language from the [lang] route segment.
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isEnabledLocale(value)) notFound();
  return value;
}

export async function getMessages(): Promise<Messages> {
  return loaders[await getLocale()]();
}
