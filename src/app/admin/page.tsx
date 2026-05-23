import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import {
  getAdminStats,
  getAdminProjects,
  getAdminBuilders,
} from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, projects, builders] = await Promise.all([
    getAdminStats(),
    getAdminProjects(),
    getAdminBuilders(),
  ]);

  const latestProjects = projects.slice(0, 5);
  const latestUsers = builders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ba-text">Dashboard</h1>
        <p className="mt-1 text-sm text-ba-text-muted">Platform overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Total projects" value={stats.totalProjects} />
        <StatCard label="Total likes" value={stats.totalLikes} />
        <StatCard label="Total views" value={stats.totalViews} />
      </div>

      {stats.pendingProjects > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="font-medium text-amber-200">
            {stats.pendingProjects} project{stats.pendingProjects === 1 ? "" : "s"} awaiting review
          </p>
          <Link href="/admin/projects" className="mt-2 inline-block text-sm text-ba-accent">
            Review projects →
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ba-border bg-ba-surface p-5">
          <h2 className="font-semibold text-ba-text">Latest projects</h2>
          {latestProjects.length === 0 ? (
            <p className="mt-4 text-sm text-ba-text-muted">No projects yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {latestProjects.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="text-ba-text">{p.title}</span>
                  <span className="text-ba-text-muted">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-ba-border bg-ba-surface p-5">
          <h2 className="font-semibold text-ba-text">Latest users</h2>
          {latestUsers.length === 0 ? (
            <p className="mt-4 text-sm text-ba-text-muted">No users yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {latestUsers.map((u) => (
                <li key={u.id} className="flex justify-between text-sm">
                  <span className="text-ba-text">{u.full_name}</span>
                  <span className="text-ba-text-muted">{formatDate(u.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
