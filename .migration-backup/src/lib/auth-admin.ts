import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile as Profile | null };
}

export async function isAdmin(): Promise<boolean> {
  const { profile } = await getSessionProfile();
  return profile?.role === "admin" && profile?.is_active === true;
}

/** Redirects non-admins; returns admin profile. */
export async function requireAdmin(): Promise<Profile> {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/auth/login?next=/admin");
  if (!profile || profile.role !== "admin" || !profile.is_active) {
    redirect("/?error=admin_required");
  }
  return profile;
}
