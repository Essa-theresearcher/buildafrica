import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { apiFetch } from "@/lib/api";

export type Role = "builder" | "startup" | "company";

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
