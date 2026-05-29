// Mirrors the BuildHub web data layer (artifacts/buildhub/src/lib/api.ts) but for
// Expo. There is no browser cookie jar on mobile, so the Clerk session token is
// attached explicitly as a Bearer header via a getter wired up in _layout.tsx.

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
export const API_BASE = DOMAIN ? `https://${DOMAIN}` : "";

let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authTokenGetter) {
    try {
      const token = await authTokenGetter();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // No token available — request proceeds unauthenticated.
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ── Startup types (shape returned by the live /api/startups endpoints) ─────────

export interface StartupTeamMember {
  builder_clerk_id: string;
  builder_name: string;
  builder_avatar_url: string | null;
  role: string;
  is_founder: boolean;
}

export interface StartupUpdate {
  id: string;
  startup_id: string;
  posted_by_name: string;
  posted_by_avatar_url: string | null;
  title: string;
  body: string;
  update_type: "shipped" | "milestone" | "setback" | "looking_for" | "general";
  created_at: string;
}

export interface Startup {
  id: string;
  founder_clerk_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  problem_solved: string;
  category: string;
  stage: string;
  logo_url: string | null;
  cover_image_url: string | null;
  demo_url: string | null;
  product_url: string | null;
  github_url: string | null;
  looking_for: string[] | null;
  traction_users: string | null;
  traction_revenue: string | null;
  markets_served: string | null;
  is_hiring: boolean;
  total_upvotes: number;
  total_views: number;
  created_at: string;
  updated_at: string;
  team_members: StartupTeamMember[];
}

export interface StartupStats {
  startup_count: number;
  builder_count: number;
  launched_count: number;
}
