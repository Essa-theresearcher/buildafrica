"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-ba-border bg-ba-bg px-4 py-2.5 text-sm text-ba-text focus:border-ba-accent focus:outline-none";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const fullName = form.get("full_name") as string;

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    router.push(next);
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {mode === "signup" && (
        <div>
          <label htmlFor="full_name" className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Full name
          </label>
          <input id="full_name" name="full_name" required className={inputClass} />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ba-text-muted">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ba-text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-ba-text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/auth/signup" className="text-ba-accent hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-ba-accent hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
