import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { apiFetch } from "@/lib/api";

export type Role = "builder" | "startup" | "company";

// Role chosen on the sign-up screen, persisted across Clerk's account-creation
// redirect so it can be saved to the profile once the new user is authenticated.
// It is timestamped and short-lived so a stale role from an abandoned sign-up
// can never bleed into a later (e.g. sign-in) session.
export const PENDING_ROLE_KEY = "buildhub_pending_role";
const PENDING_ROLE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isRole(v: unknown): v is Role {
  return v === "builder" || v === "startup" || v === "company";
}

export function writePendingRole(role: Role): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_ROLE_KEY, JSON.stringify({ role, ts: Date.now() }));
}

export function readPendingRole(): Role | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PENDING_ROLE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { role?: unknown; ts?: unknown };
    if (isRole(parsed.role) && typeof parsed.ts === "number" && Date.now() - parsed.ts < PENDING_ROLE_TTL_MS) {
      return parsed.role;
    }
  } catch {
    // Legacy/corrupt value — treat as absent.
  }
  return null;
}

export function clearPendingRole(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_ROLE_KEY);
}

export interface UserProfile {
  clerk_id: string;
  role: Role;
  display_name: string | null;
  created_at: string;
}

export function useMyProfile() {
  const { isSignedIn, isLoaded } = useUser();

  const query = useQuery<UserProfile | null>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const data = await apiFetch("/api/me");
      return data.profile ?? null;
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const qc = useQueryClient();

  const setRole = useMutation({
    mutationFn: async (role: Role) => {
      const data = await apiFetch("/api/me", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      return data.profile as UserProfile;
    },
    onSuccess: (profile) => {
      qc.setQueryData(["my-profile"], profile);
    },
  });

  return {
    profile: query.data ?? null,
    isLoading: !isLoaded || query.isLoading,
    setRole,
  };
}
