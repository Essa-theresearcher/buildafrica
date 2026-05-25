import { useState } from "react";
import { Search, ExternalLink, Users } from "lucide-react";
import { projects, getBuildersByIds, getInitials } from "../data/seed";
import { Link } from "wouter";
import type { ProjectStatus } from "../types";

const statusColors: Record<string, string> = {
  Idea: "status-idea",
  Building: "status-building",
  Launched: "status-launched",
  Verified: "status-verified",
};

const statusOptions: ("all" | ProjectStatus)[] = ["all", "Idea", "Building", "Launched", "Verified"];

export default function Projects() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ProjectStatus>("all");

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.techStack.some((t) => t.toLowerCase().includes(q));
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Projects</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Real products shipped by BuildHub builders. Verified by the community.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search by name, description, or tech stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterStatus === s
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm text-[var(--text-muted)]">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const teamBuilders = getBuildersByIds(project.builderIds);
            return (
              <div key={project.id} className="card flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[var(--text)]">{project.name}</h3>
                  <span className={`badge ${statusColors[project.status]} flex-shrink-0`}>
                    {project.status}
                  </span>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
                  {project.description}
                </p>
                <div className="mb-4 rounded-lg bg-[var(--surface-elevated)] p-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Builder Contribution
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text)]">
                    {project.contribution}
                  </p>
                </div>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-[var(--surface-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                    >
                      {t}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="rounded-md bg-[var(--surface-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {teamBuilders.slice(0, 3).map((b) => (
                        <Link key={b.id} href={`/builders/${b.username}`}>
                          <div
                            title={b.name}
                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface)] gradient-bg text-[10px] font-bold text-white"
                          >
                            {getInitials(b.name)}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {teamBuilders.length > 1 ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {teamBuilders.length} builders
                        </span>
                      ) : (
                        teamBuilders[0]?.name.split(" ")[0]
                      )}
                    </span>
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[var(--accent)] no-underline hover:text-[var(--accent-hover)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Demo
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-[var(--text-muted)]">
          No projects match your search.
        </div>
      )}
    </div>
  );
}
