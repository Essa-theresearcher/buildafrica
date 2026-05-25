import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

/** GET /api/health — quick Supabase connectivity check */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      hint: "Replace placeholder values in .env.local with real Supabase API keys.",
    });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return NextResponse.json({
        ok: false,
        configured: true,
        database: false,
        error: error.message,
        hint: "Run supabase/full-setup.sql in the Supabase SQL Editor.",
      });
    }

    return NextResponse.json({ ok: true, configured: true, database: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({
      ok: false,
      configured: true,
      error: message,
      hint: "Check Project URL (must be https://xxxx.supabase.co) and that the project is not paused.",
    });
  }
}
