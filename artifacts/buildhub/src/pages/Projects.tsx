import { useState } from "react";
import { Search, ExternalLink, Users, Package } from "lucide-react";
import { projects, getBuildersByIds, getInitials } from "../data/seed";
import { Link } from "wouter";
import type { ProjectStatus } from "../types";

const statuses: Record<string, { cls: string; label: string }> = {
  Idea:     { cls: "status-pill status-idea",     label: "Idea" },
  Building: { cls: "status-pill status-building", label: "Building" },
  Launched: { cls: "status-pill status-launched", label: "Launched" },
  Verified: { cls: "status-pill status-verified", label: "Verified" },
};

const ALL = "all" as const;
type Filter = typeof ALL | ProjectStatus;

export default function Projects() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Filter>(ALL);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.techStack.some((t) => t.toLowerCase().includes(q));
    const matchStatus = status === ALL || p.status === status;
    return matchSearch && matchStatus;
  });

  const filterBtns: { value: Filter; label: string }[] = [
    { value: ALL, label: "All" },
    { value: "Idea", label: "Idea" },
    { value: "Building", label: "Building" },
    { value: "Launched", label: "Launched" },
    { value: "Verified", label: "Verified" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Showcase</div>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 10px" }}>
          Projects
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 480 }}>
          Real products built by BuildHub builders. Verified by the community for quality, contribution, and reliability.
        </p>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{ padding: "14px 18px", marginBottom: 28, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}
      >
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}>
          <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)" }} />
          <input
            type="search"
            placeholder="Name, description, stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterBtns.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              style={{
                padding: "5px 14px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "1.5px solid",
                borderColor: status === value ? "var(--accent)" : "var(--border)",
                background: status === value ? "var(--accent-subtle)" : "transparent",
                color: status === value ? "var(--accent)" : "var(--text-muted)",
                transition: "all 140ms ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>{filtered.length}</strong> project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {filtered.map((project) => {
            const team = getBuildersByIds(project.builderIds);
            const s = statuses[project.status];
            return (
              <div key={project.id} className="card" style={{ display: "flex", flexDirection: "column", padding: 22 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>{project.name}</h3>
                  <span className={s.cls} style={{ flexShrink: 0 }}>{s.label}</span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                  marginBottom: 14,
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {project.description}
                </p>

                {/* Contribution */}
                <div
                  style={{
                    borderRadius: 9,
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    padding: "10px 12px",
                    marginBottom: 14,
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 4px" }}>
                    Builder contribution
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: "var(--text)",
                    lineHeight: 1.6,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {project.contribution}
                  </p>
                </div>

                {/* Tech stack */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {project.techStack.slice(0, 4).map((t) => <span key={t} className="skill-chip">{t}</span>)}
                  {project.techStack.length > 4 && <span className="skill-chip">+{project.techStack.length - 4}</span>}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex" }}>
                      {team.slice(0, 3).map((b) => (
                        <Link key={b.id} href={`/builders/${b.username}`}
                          title={b.name}
                          style={{ display: "block", textDecoration: "none" }}
                        >
                          <div
                            className="gradient-bg"
                            style={{
                              width: 26, height: 26, borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, fontWeight: 700, color: "#fff",
                              marginLeft: -6, border: "2.5px solid var(--surface)",
                            }}
                          >
                            {getInitials(b.name)}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      {team.length > 1 ? (
                        <><Users style={{ width: 11, height: 11 }} /> {team.length} builders</>
                      ) : (
                        team[0]?.name.split(" ")[0]
                      )}
                    </span>
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
                    >
                      <ExternalLink style={{ width: 12, height: 12 }} />
                      Demo
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
          <Package style={{ width: 32, height: 32, color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>No projects match your search.</p>
        </div>
      )}
    </div>
  );
}
