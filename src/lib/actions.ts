"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ProjectCategory } from "@/lib/types";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function toggleLike(
  projectId: string,
  slug: string
): Promise<{ error?: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/projects/${slug}`);
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .maybeSingle();

  const { data: project } = await supabase
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();
  if (project?.status !== "approved") {
    return { error: "Only approved projects can be upvoted." };
  }

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ user_id: user.id, project_id: projectId });
    await supabase.from("activity").insert({
      type: "project_liked",
      user_id: user.id,
      project_id: projectId,
      message: "Someone upvoted a project",
    });
  }

  revalidatePath(`/projects/${slug}`);
  revalidatePath("/");
  revalidatePath("/explore");
  return undefined;
}

export async function incrementViews(slug: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_project_views", { project_slug: slug });
}

export interface CreateProjectInput {
  title: string;
  short_description: string;
  problem_solved: string;
  category: ProjectCategory;
  tech_stack: string[];
  demo_url: string;
  github_url: string;
  contact_email: string;
  whatsapp: string;
  screenshots: string[];
}

export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add a project." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.is_active) {
    return { error: "Your account is suspended. Contact support." };
  }

  let slug = slugify(input.title);
  const { data: existing } = await supabase
    .from("projects")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: input.title,
      slug,
      short_description: input.short_description,
      problem_solved: input.problem_solved,
      category: input.category,
      tech_stack: input.tech_stack,
      demo_url: input.demo_url || null,
      github_url: input.github_url || null,
      contact_email: input.contact_email,
      whatsapp: input.whatsapp || null,
      screenshots: input.screenshots,
      status: "pending",
      is_featured: false,
    })
    .select("id, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.from("activity").insert({
    type: "project_launched",
    user_id: user.id,
    project_id: project.id,
    message: `${profile?.full_name ?? "A builder"} submitted ${input.title} for review`,
  });

  revalidatePath("/");
  revalidatePath("/explore");
  redirect(`/projects/${project?.slug}?submitted=pending`);
}

export interface UpdateProfileInput {
  full_name: string;
  bio: string;
  location: string;
  skills: string[];
  whatsapp: string;
  twitter: string;
  github: string;
  linkedin: string;
  website: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const social_links: Record<string, string> = {};
  if (input.twitter) social_links.twitter = input.twitter;
  if (input.github) social_links.github = input.github;
  if (input.linkedin) social_links.linkedin = input.linkedin;
  if (input.website) social_links.website = input.website;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      bio: input.bio,
      location: input.location,
      skills: input.skills,
      whatsapp: input.whatsapp || null,
      social_links,
    })
    .eq("id", user.id)
    .select("username")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/builders/${profile.username}`);
  redirect(`/builders/${profile.username}`);
}
