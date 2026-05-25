import { Link } from "wouter";
import { ShieldCheck, MapPin, Briefcase, Mail, ExternalLink, ArrowLeft, Users, Package, Clock } from "lucide-react";
import { getBuilderByUsername, projects, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";

const statuses: Record<string, string> = {
  Idea: "status-pill status-idea",
  Building: "status-pill status-building",
  Launched: "status-pill status-launched",
  Verified: "status-pill status-verified",
};

export default function BuilderProfile({ params }: { params: { username: string } }) {
  const builder = getBuilderByUsername(params.username);

  if (!builder) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>Builder not found</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>This profile doesn't exist or was removed.</p>
        <Link href="/builders" className="btn btn-primary" style={{ display: "inline-flex", marginTop: 28 }}>
          Back to Builders
        </Link>
      </div>
    );
  }

  const builderProjects = projects.filter((p) => p.builderIds.includes(builder.id));
  const collaborators = getBuildersByIds(builder.collaborators);

  const availStyle = builder.availability === "Available"
    ? { background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }
    : builder.availability === "Limited"
    ? { background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }
    : { background: "var(--surface-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Link href="/builders" className="btn btn-ghost" style={{ marginBottom: 24, display: "inline-flex", marginLeft: -8 }}>
        <ArrowLeft style={{ width: 15, height: 15 }} />
        All Builders
      </Link>

      {/* Hero card */}
      <div className="card" style={{ padding: "32px 32px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          {/* Avatar */}
          <div className="avatar avatar-xl" style={{ fontSize: 28 }}>
            {getInitials(builder.name)}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
                {builder.name}
              </h1>
              {builder.verificationStatus === "Verified" && (
                <span className="badge badge-verified" style={{ fontSize: 11 }}>
                  <ShieldCheck style={{ width: 10, height: 10 }} />
                  Verified Builder
                </span>
              )}
              {builder.verificationStatus === "Pending" && (
                <span className="badge badge-available" style={{ fontSize: 11 }}>Pending Review</span>
              )}
              <span
                className="badge"
                style={{ marginLeft: "auto", fontSize: 11, ...availStyle }}
              >
                {builder.availability}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-muted)" }}>
                <Briefcase style={{ width: 14, height: 14 }} />
                {builder.role}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-muted)" }}>
                <MapPin style={{ width: 14, height: 14 }} />
                {builder.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-muted)" }}>
                <Clock style={{ width: 14, height: 14 }} />
                Joined {new Date(builder.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>

            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
              {builder.bio}
            </p>
          </div>
        </div>

        {/* Tags */}
        {builder.tags.length > 0 && (
          <>
            <div className="divider" style={{ margin: "24px 0 20px" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {builder.tags.map((tag) => (
                <ReputationBadge key={tag} tag={tag} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}
        className="grid-cols-responsive"
      >
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Skills */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 14px" }}>
              Skills
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {builder.skills.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 14px" }}>
              Contact
            </h3>
            <a
              href={`mailto:${builder.contact}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                border: "1px solid var(--accent-subtle-md)",
                transition: "opacity 160ms",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <Mail style={{ width: 15, height: 15 }} />
              Send Message
            </a>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <Users style={{ width: 12, height: 12 }} />
                Collaborated With
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {collaborators.map((c) => (
                  <Link key={c.id} href={`/builders/${c.username}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div className="avatar avatar-sm">{getInitials(c.name)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.role}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main — Projects */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Package style={{ width: 18, height: 18, color: "var(--accent)" }} />
            Projects Shipped
            <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 20, background: "var(--accent-subtle)", color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>
              {builderProjects.length}
            </span>
          </h2>

          {builderProjects.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {builderProjects.map((project) => {
                const team = getBuildersByIds(project.builderIds).filter((b) => b.id !== builder.id);
                return (
                  <div key={project.id} className="card" style={{ padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", margin: 0 }}>{project.name}</h3>
                      <span className={statuses[project.status]} style={{ flexShrink: 0 }}>{project.status}</span>
                    </div>

                    <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 16 }}>
                      {project.description}
                    </p>

                    {/* Contribution highlight */}
                    <div
                      style={{
                        borderRadius: 10,
                        background: "var(--surface-elevated)",
                        border: "1px solid var(--border)",
                        padding: "12px 14px",
                        marginBottom: 14,
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 6px" }}>
                        Contribution
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                        {project.contribution}
                      </p>
                    </div>

                    {/* Tech */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {project.techStack.map((t) => <span key={t} className="skill-chip">{t}</span>)}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      {team.length > 0 && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                          <Users style={{ width: 12, height: 12 }} />
                          With {team.map((b) => b.name.split(" ")[0]).join(", ")}
                        </span>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink style={{ width: 12, height: 12 }} />
                          Live demo
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No projects shipped yet.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .grid-cols-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
