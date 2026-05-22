import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/config";

export function SetupBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-100">Supabase not connected</p>
            <p className="mt-1 text-sm text-amber-200/80">
              Add credentials to <code className="rounded bg-black/20 px-1">.env.local</code>,
              then run <code className="rounded bg-black/20 px-1">supabase/full-setup.sql</code> in
              the SQL Editor.
            </p>
          </div>
        </div>
        <Link
          href="https://github.com/Essa-theresearcher/buildafrica#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-100"
        >
          Setup guide
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
