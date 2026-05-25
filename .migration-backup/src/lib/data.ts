import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { Activity, Profile, Project, ProjectWithBuilder, SortOption } from "@/lib/types";

const projectSelect = `
  *,
  profiles (
    id, full_name, username, avatar_url, bio, location, skills,
    whatsapp, email, social_links, build_score, role, is_active,
    is_builder_of_week, created_at
  )
`;

export async function getFeaturedProjects(limit = 6): Promise<ProjectWithBuilder[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("likes", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProjects:", error.message);
    return [];
  }
  return (data ?? []) as ProjectWithBuilder[];
}

export async function getTrendingBuilders(limit = 5): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("is_builder_of_week", { ascending: false })
    .order("build_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getTrendingBuilders:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getRecentActivity(limit = 8): Promise<Activity[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentActivity:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProjects(options: {
  search?: string;
  category?: string;
  sort?: SortOption;
}): Promise<ProjectWithBuilder[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase.from("projects").select(projectSelect).eq("status", "approved");

  if (options.search?.trim()) {
    query = query.ilike("title", `%${options.search.trim()}%`);
  }
  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  switch (options.sort) {
    case "most_viewed":
      query = query.order("views", { ascending: false });
      break;
    case "most_liked":
      query = query.order("likes", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProjects:", error.message);
    return [];
  }
  return (data ?? []) as ProjectWithBuilder[];
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithBuilder | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const project = data as ProjectWithBuilder;
  const isOwner = user?.id === project.user_id;
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const isAdminUser = profile?.role === "admin";

  if (project.status !== "approved" && !isOwner && !isAdminUser) return null;
  return project;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getProjectsByUserId(
  userId: string,
  options?: { includeNonApproved?: boolean }
): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").eq("user_id", userId);

  if (!options?.includeNonApproved) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function userLikedProject(
  userId: string | undefined,
  projectId: string
): Promise<boolean> {
  if (!userId || !isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();
  return !!data;
}
