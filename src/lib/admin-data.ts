import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type {
  Activity,
  AdminStats,
  LaunchFridaySettings,
  Profile,
  ProjectWithBuilder,
} from "@/lib/types";

const projectSelect = `
  *,
  profiles (
    id, full_name, username, avatar_url, email, role, is_active,
    is_builder_of_week, build_score, created_at
  )
`;

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const [users, projects, likes, views, pending] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("likes").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("views"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const totalViews =
    views.data?.reduce((sum, p) => sum + (p.views ?? 0), 0) ?? 0;

  return {
    totalUsers: users.count ?? 0,
    totalProjects: projects.count ?? 0,
    totalLikes: likes.count ?? 0,
    totalViews,
    pendingProjects: pending.count ?? 0,
  };
}

export async function getAdminProjects(): Promise<ProjectWithBuilder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(projectSelect)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProjectWithBuilder[];
}

export async function getAdminProject(id: string): Promise<ProjectWithBuilder | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("id", id)
    .maybeSingle();
  return data as ProjectWithBuilder | null;
}

export async function getAdminBuilders(search?: string): Promise<Profile[]> {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (search?.trim()) {
    query = query.or(
      `full_name.ilike.%${search.trim()}%,username.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
    );
  }
  const { data } = await query;
  return (data ?? []) as Profile[];
}

export async function getAdminActivity(limit = 50): Promise<Activity[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getApprovedProjectsForFeatured(): Promise<ProjectWithBuilder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("status", "approved")
    .order("title");
  return (data ?? []) as ProjectWithBuilder[];
}

export async function getLaunchFridaySettings(): Promise<LaunchFridaySettings> {
  if (!isSupabaseConfigured()) {
    return { enabled: false, title: "Launch Friday", message: "" };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "launch_friday")
    .maybeSingle();
  const v = data?.value as LaunchFridaySettings | undefined;
  return {
    enabled: v?.enabled ?? false,
    title: v?.title ?? "Launch Friday",
    message: v?.message ?? "",
  };
}

export async function getBuilderOfWeek(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_builder_of_week", true)
    .eq("is_active", true)
    .maybeSingle();
  return data as Profile | null;
}
