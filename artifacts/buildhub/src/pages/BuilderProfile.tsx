import { Link } from "wouter";
import { ShieldCheck, MapPin, Briefcase, Mail, ExternalLink, ArrowLeft, Users, Package } from "lucide-react";
import { getBuilderByUsername, projects, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";

const statusColors: Record<string, string> = {
  Idea: "status-idea",
  Building: "status-building",
  Launched: "status-launched",
  Verified: "status-verified",
};

export default function BuilderProfile({ params }: { params: { username: string } }) {
  const builder = getBuilderByUsername(params.username);

  if (!builder) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--text)]">Builder not found</h1>
        <p className="mt-2 text-[var(--text-muted)]">This profile doesn't exist or has been removed.</p>
        <Link href="/builders" className="btn-primary mx-auto mt-6 inline-flex">
          Back to Builders
        </Link>
      </div>
    );
  }

  const builderProjects = projects.filter((p) => p.builderIds.includes(builder.id));
  const collaborators = getBuildersByIds(builder.collaborators);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/builders" className="btn-ghost mb-6 inline-flex -ml-2">
        <ArrowLeft className="h-4 w-4" />
        All Builders
      </Link>

      {/* Header */}
      <div className="card mb-6 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl gradient-bg text-2xl font-bold text-white">
            {getInitials(builder.name)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text)]">{builder.name}</h1>
              {builder.verificationStatus === "Verified" ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Builder
                </span>
              ) : builder.verificationStatus === "Pending" ? (
                <span className="rounded-full bg-[var(--warning)]/10 px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                  Verification Pending
                </span>
              ) : null}
              <span
                className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                  builder.availability === "Available"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : builder.availability === "Limited"
                    ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                    : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                }`}
              >
                {builder.availability}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {builder.role}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {builder.location}
              </span>
            </div>
            <p className="mt-4 leading-relaxed text-[var(--text-muted)]">{builder.bio}</p>
          </div>
        </div>

        <hr className="divider my-6" />

        <div className="flex flex-wrap gap-2">
          {builder.tags.map((tag) => (
            <ReputationBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5">
          {/* Skills */}
          <div className="card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {builder.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-[var(--surface-elevated)] px-3 py-1.5 text-sm text-[var(--text)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Contact</h3>
            <a
              href={`mailto:${builder.contact}`}
              className="flex items-center gap-2 rounded-lg bg-[var(--accent)]/10 px-4 py-3 text-sm font-medium text-[var(--accent)] no-underline hover:bg-[var(--accent)]/20"
            >
              <Mail className="h-4 w-4" />
              Send Message
            </a>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                <Users className="h-3.5 w-3.5" />
                Collaborated With
              </h3>
              <div className="space-y-2.5">
                {collaborators.map((c) => (
                  <Link
                    key={c.id}
                    href={`/builders/${c.username}`}
                    className="flex items-center gap-3 no-underline"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg gradient-bg text-xs font-bold text-white">
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{c.role}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Joined */}
          <div className="rounded-xl border border-[var(--border-color)] p-4">
            <p className="text-xs text-[var(--text-muted)]">
              Member since{" "}
              {new Date(builder.joinedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Right column — Projects */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text)]">
            <Package className="h-5 w-5 text-[var(--accent)]" />
            Projects Shipped
          </h2>
          {builderProjects.length > 0 ? (
            <div className="space-y-4">
              {builderProjects.map((project) => {
                const teamBuilders = getBuildersByIds(project.builderIds).filter(
                  (b) => b.id !== builder.id
                );
                return (
                  <div key={project.id} className="card p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-[var(--text)]">{project.name}</h3>
                      <span className={`badge ${statusColors[project.status]} flex-shrink-0`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {project.description}
                    </p>
                    <div className="mb-3 rounded-lg bg-[var(--surface-elevated)] p-3">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        Contribution
                      </div>
                      <p className="text-sm text-[var(--text)]">{project.contribution}</p>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {project.techStack.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-[var(--surface-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3">
                      {teamBuilders.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                          <Users className="h-3.5 w-3.5" />
                          With {teamBuilders.map((b) => b.name.split(" ")[0]).join(", ")}
                        </div>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[var(--accent)] no-underline hover:text-[var(--accent-hover)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Live demo
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-10 text-center text-[var(--text-muted)]">
              No projects shipped yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
