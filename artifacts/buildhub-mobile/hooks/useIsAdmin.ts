import { useUser } from "@clerk/expo";

// Mirrors the web app's admin gate (VITE_ADMIN_CLERK_IDS). The comma-separated
// list of Clerk user IDs is injected at build time via EXPO_PUBLIC_ADMIN_CLERK_IDS
// (wired from the ADMIN_CLERK_IDS secret in the dev script). The backend also
// enforces admin via requireAdmin, so this only controls UI visibility.
const adminIds = (process.env.EXPO_PUBLIC_ADMIN_CLERK_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function useIsAdmin(): boolean {
  const { user } = useUser();
  return !!user && adminIds.includes(user.id);
}
