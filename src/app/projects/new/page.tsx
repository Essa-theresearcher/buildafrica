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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ba-text">Add Project</h1>
        <p className="mt-2 text-ba-text-muted">
          Share your SaaS, MVP, or tool with the BuildAfrica community.
        </p>
      </div>
      <div className="rounded-2xl border border-ba-border bg-ba-surface p-6 sm:p-8">
        <ProjectForm userEmail={user.email ?? ""} />
      </div>
    </div>
  );
}
