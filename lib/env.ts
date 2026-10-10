// Validated public env. NEXT_PUBLIC_ vars must be read as literal
// `process.env.NAME` so Next.js can inline them into browser code.

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing env var ${name}. Copy .env.example to .env.local and fill it in.`);
  }
  return value.trim();
}

function validateUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${value}"`);
  }
  const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol !== "https:" && !isLocal) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use https://");
  }
  return value.replace(/\/+$/, "");
}

function validatePublishableKey(value: string): string {
  if (value.startsWith("eyJ")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks like a legacy anon/service_role key. Use the publishable key (sb_publishable_…).",
    );
  }
  if (!value.startsWith("sb_publishable_")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable key (sb_publishable_…).");
  }
  return value;
}

export const env = {
  supabaseUrl: validateUrl(
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  ),
  supabasePublishableKey: validatePublishableKey(
    required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  ),
};
