import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/projects/new");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", user.id)
    .single();

  if (profile && !profile.is_active) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
        <h1 className="text-xl font-semibold text-rose-200">Account suspended</h1>
        <p className="mt-2 text-sm text-ba-text-muted">
          You cannot upload projects while suspended. Contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ba-text">Add Project</h1>
        <p className="mt-2 text-ba-text-muted">
          Share your SaaS, MVP, or tool. Projects are reviewed before going public.
        </p>
      </div>
      <div className="rounded-2xl border border-ba-border bg-ba-surface p-6 sm:p-8">
        <ProjectForm userEmail={user.email ?? ""} />
      </div>
    </div>
  );
}
