// Every language the site has messages for, and which of them are live.
// To turn English on: add "en" to enabledLocales and fill in messages/en.json.
export const locales = ["hi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "hi";
export const enabledLocales: readonly Locale[] = ["hi", "en"];

export const isEnabledLocale = (value: string): value is Locale =>
  (enabledLocales as readonly string[]).includes(value);
