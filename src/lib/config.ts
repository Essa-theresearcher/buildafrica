const PLACEHOLDER_URL = "your-project";
const PLACEHOLDER_KEY = "your-anon-key";

/** True when Supabase env vars are set (not placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.length > 0 &&
    key.length > 0 &&
    url.includes(".supabase.co") &&
    key.startsWith("eyJ") &&
    !url.includes(PLACEHOLDER_URL) &&
    !key.includes(PLACEHOLDER_KEY)
  );
}

/** Throws if .env.local still has example values — use before auth/API calls. */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Open buildafrica/.env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your Supabase project → Settings → API."
    );
  }

  return { url, anonKey };
}
