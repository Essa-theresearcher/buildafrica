import { useUser } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

export type Role = "builder" | "startup" | "company";

export interface UserProfile {
  id?: string;
  clerk_id?: string;
  role: Role;
  display_name?: string | null;
  [key: string]: any;
}

// Mirrors the web app's useMyProfile() (GET /api/me). Returns the signed-in
// user's BuildHub profile (role etc.) or null if they have not onboarded yet.
export function useMyProfile() {
  const { isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { profile } = await apiFetch<{ profile: UserProfile | null }>("/api/me");
      setProfile(profile);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) refetch();
  }, [isLoaded, refetch]);

  return {
    profile,
    role: profile?.role ?? null,
    loading: loading || !isLoaded,
    refetch,
    isSignedIn: !!isSignedIn,
    isLoaded,
  };
}
