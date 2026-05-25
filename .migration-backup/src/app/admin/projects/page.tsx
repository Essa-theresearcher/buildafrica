import { ProjectsTable } from "@/components/admin/projects-table";
import { getAdminProjects } from "@/lib/admin-data";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; status?: string }>;
}) {
  const params = await searchParams;
  let projects = await getAdminProjects();

  if (params.user) {
    projects = projects.filter((p) => p.user_id === params.user);
  }
  if (params.status) {
    projects = projects.filter((p) => p.status === params.status);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ba-text">Manage Projects</h1>
          <p className="mt-1 text-sm text-ba-text-muted">
            Approve, feature, edit, or remove projects
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <a href="/admin/projects" className="text-ba-accent">
            All
          </a>
          <a href="/admin/projects?status=pending" className="text-ba-text-muted hover:text-ba-text">
            Pending
          </a>
          <a href="/admin/projects?status=approved" className="text-ba-text-muted hover:text-ba-text">
            Approved
          </a>
        </div>
      </div>
      <ProjectsTable projects={projects} />
    </div>
  );
}
