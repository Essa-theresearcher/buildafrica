"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import { createClient } from "@/lib/supabase/server";
import type { LaunchFridaySettings, ProjectCategory, ProjectStatus } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  revalidatePath("/explore");
}

export async function adminUpdateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  rejectionReason?: string
) {
  await requireAdmin();
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "rejected") {
    updates.rejection_reason = rejectionReason ?? "Does not meet guidelines.";
    updates.is_featured = false;
  }
  if (status === "approved") updates.rejection_reason = null;

  const { error } = await supabase.from("projects").update(updates).eq("id", projectId);
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminToggleFeatured(projectId: string, isFeatured: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ is_featured: isFeatured })
    .eq("id", projectId)
    .eq("status", "approved");
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminUpdateProjectCategory(projectId: string, category: ProjectCategory) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ category }).eq("id", projectId);
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminDeleteProject(projectId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminUpdateUserRole(userId: string, role: "user" | "admin") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminToggleUserActive(userId: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminSetBuilderOfWeek(userId: string | null) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_builder_of_week: false }).eq("is_builder_of_week", true);
  if (userId) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_builder_of_week: true })
      .eq("id", userId);
    if (error) return { error: error.message };
  }
  revalidateAll();
  return { success: true };
}

export async function adminSaveLaunchFriday(settings: LaunchFridaySettings) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "launch_friday",
    value: settings,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}

export async function adminDeleteActivity(activityId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("activity").delete().eq("id", activityId);
  if (error) return { error: error.message };
  revalidateAll();
  return { success: true };
}
