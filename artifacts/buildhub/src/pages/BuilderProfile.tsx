import { Link } from "wouter";
import {
  ShieldCheck, MapPin, Briefcase, Mail, ExternalLink,
  ArrowLeft, Users, Package, Clock, Zap, Quote, AlertCircle,
} from "lucide-react";
import { getBuilderByUsername, getBuilderById, projects, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";

const STATUS_CLS: Record<string, string> = {
  Idea:     "status-pill status-idea",
  Building: "status-pill status-building",
  Launched: "status-pill status-launched",
  Verified: "status-pill status-verified",
};

/* Sort projects: Verified > Launched > Building > Idea */
const STATUS_ORDER: Record<string, number> = { Verified: 0, Launched: 1, Building: 2, Idea: 3 };

export default function BuilderProfile({ params }: { params: { username: string } }) {
  const builder = getBuilderByUsername(params.username);

  if (!builder) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>Builder not found</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>This profile doesn't exist or has been removed.</p>
        <Link href="/builders" className="btn btn-primary" style={{ display: "inline-flex", marginTop: 28 }}>
          Back to Builders
        </Link>
      </div>
    );
  }

  const builderProjects = projects
    .filter((p) => p.builderIds.includes(builder.id))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const launchedCount = builderProjects.filter((p) => p.status === "Launched" || p.status === "Verified").length;
  const collaborators = getBuildersByIds(builder.collaborators);
  const endorsements = (builder.endorsements || []).map((e) => ({
    ...e,
    author: getBuilderById(e.fromId),
  }));

  const isVerified = builder.verificationStatus === "Verified";
  const isPending  = builder.verificationStatus === "Pending";

  const availColor = builder.availability === "Available"
    ? { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success-border)" }
    : builder.availability === "Limited"
    ? { bg: "var(--warning-bg)", color: "var(--warning)", border: "var(--warning-border)" }
    : { bg: "var(--surface-elevated)", color: "var(--text-muted)", border: "var(--border)" };

  /* Which skills are backed by a shipped project */
  const provenSkills = new Set(
    builderProjects
      .filter((p) => p.status === "Launched" || p.status === "Verified")
      .flatMap((p) => p.techStack)
  );

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <Link href="/builders" className="btn btn-ghost" style={{ marginBottom: 20, display: "inline-flex", marginLeft: -8 }}>
        <ArrowLeft style={{ width: 15, height: 15 }} />
        All Builders
      </Link>

      {/* ── AVAILABILITY BANNER (Q4: Available right now?) ────── */}
      <div
        style={{
          borderRadius: 12,
          padding: "11px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: availColor.bg,
          border: `1.5px solid ${availColor.border}`,
        }}
      >
        <Zap style={{ width: 15, height: 15, color: availColor.color, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: availColor.color }}>
          {builder.availability === "Available"
            ? `${builder.name.split(" ")[0]} is available for work right now.`
            : builder.availability === "Limited"
            ? `${builder.name.split(" ")[0]} has limited availability — reach out to discuss timing.`
            : `${builder.name.split(" ")[0]} is not available for new projects at this time.`}
        </p>
        {builder.availability !== "Unavailable" && (
          <a
            href={`mailto:${builder.contact}`}
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 9,
              background: availColor.color,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            <Mail style={{ width: 13, height: 13 }} />
            Contact Now
          </a>
        )}
      </div>

      {/* ── HERO CARD ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: "28px 28px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <div className="avatar avatar-xl" style={{ fontSize: 26 }}>
            {getInitials(builder.name)}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            {/* Name + verification checkmark */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
                {builder.name}
              </h1>
              {isVerified && (
                <span
                  title="BuildHub Verified — this builder was reviewed and approved by a BuildHub admin."
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#fff",
                    flexShrink: 0,
                    cursor: "help",
                  }}
                >
                  <ShieldCheck style={{ width: 14, height: 14 }} />
                </span>
              )}
              {isPending && (
                <span
                  title="Verification pending — this profile is under admin review."
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--warning-bg)",
                    border: "1.5px solid var(--warning-border)",
                    color: "var(--warning)",
                    flexShrink: 0,
                    cursor: "help",
                  }}
                >
                  <AlertCircle style={{ width: 13, height: 13 }} />
                </span>
              )}
            </div>

            {/* Role + location */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginBottom: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "var(--text-muted)" }}>
                <Briefcase style={{ width: 13, height: 13 }} />
                {builder.role}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "var(--text-muted)" }}>
                <MapPin style={{ width: 13, height: 13 }} />
                {builder.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "var(--text-muted)" }}>
                <Clock style={{ width: 13, height: 13 }} />
                Member since {new Date(builder.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>

            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 16px" }}>
              {builder.bio}
            </p>

            {/* Reputation tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {builder.tags.map((tag) => <ReputationBadge key={tag} tag={tag} />)}
            </div>
          </div>

          {/* Contact CTA (Q5: How to contact?) */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <a
              href={`mailto:${builder.contact}`}
              className="btn btn-primary"
              style={{ padding: "11px 22px", borderRadius: 12, whiteSpace: "nowrap" }}
            >
              <Mail style={{ width: 15, height: 15 }} />
              Send Message
            </a>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>{builder.contact}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: two columns ─────────────────────────── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}
        className="profile-grid"
      >
        {/* LEFT: Projects + Endorsements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* SHIPPED PRODUCTS (Q1: What have they shipped?) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Package style={{ width: 17, height: 17, color: "var(--accent)" }} />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                Shipped Products
              </h2>
              <span style={{
                padding: "2px 9px", borderRadius: 20,
                background: "var(--accent-subtle)", color: "var(--accent)",
                fontSize: 12, fontWeight: 700,
              }}>
                {builderProjects.length}
              </span>
              {launchedCount > 0 && (
                <span style={{
                  padding: "2px 9px", borderRadius: 20,
                  background: "var(--success-bg)", color: "var(--success)",
                  fontSize: 12, fontWeight: 700,
                  border: "1px solid var(--success-border)",
                }}>
                  {launchedCount} live
                </span>
              )}
            </div>

            {builderProjects.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {builderProjects.map((project) => {
                  const team = getBuildersByIds(project.builderIds).filter((b) => b.id !== builder.id);
                  const isLive = project.status === "Launched" || project.status === "Verified";
                  return (
                    <div
                      key={project.id}
                      className="card"
                      style={{
                        padding: 22,
                        borderLeft: `3px solid ${isLive ? "var(--success)" : "var(--border)"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                          {project.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span className={STATUS_CLS[project.status]}>{project.status}</span>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
                            >
                              <ExternalLink style={{ width: 12, height: 12 }} />
                              Live
                            </a>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 14 }}>
                        {project.description}
                      </p>

                      {/* THIS BUILDER'S CONTRIBUTION — the key proof signal */}
                      <div
                        style={{
                          borderRadius: 10,
                          background: "var(--accent-subtle)",
                          border: "1px solid var(--accent-subtle-md)",
                          padding: "12px 15px",
                          marginBottom: 14,
                        }}
                      >
                        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}>
                          <ShieldCheck style={{ width: 10, height: 10 }} />
                          {builder.name.split(" ")[0]}'s contribution
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                          {/* Extract the part of the contribution relevant to this builder */}
                          {project.contribution}
                        </p>
                      </div>

                      {/* Tech stack — every skill has a receipt */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                        {project.techStack.map((t) => (
                          <span key={t} className="skill-chip">{t}</span>
                        ))}
                      </div>

                      {team.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          <div style={{ display: "flex" }}>
                            {team.slice(0, 3).map((b) => (
                              <div key={b.id} className="gradient-bg" style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff", marginLeft: -5, border: "2px solid var(--surface)" }}>
                                {getInitials(b.name)}
                              </div>
                            ))}
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Users style={{ width: 11, height: 11 }} />
                            With {team.map((b) => b.name.split(" ")[0]).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
                <Package style={{ width: 28, height: 28, color: "var(--text-muted)", margin: "0 auto 10px" }} />
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No shipped projects on record yet.</p>
              </div>
            )}
          </div>

          {/* PEER ENDORSEMENTS (Q3: What did others say?) */}
          {endorsements.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Quote style={{ width: 17, height: 17, color: "var(--success)" }} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                  From Collaborators
                </h2>
                <span style={{
                  padding: "2px 9px", borderRadius: 20,
                  background: "var(--success-bg)", color: "var(--success)",
                  fontSize: 12, fontWeight: 700, border: "1px solid var(--success-border)",
                }}>
                  {endorsements.length} endorsement{endorsements.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {endorsements.map((e, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: "20px 22px",
                      borderLeft: "3px solid var(--success)",
                    }}
                  >
                    <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, margin: "0 0 14px", fontStyle: "italic" }}>
                      "{e.note}"
                    </p>
                    {e.author && (
                      <Link
                        href={`/builders/${e.author.username}`}
                        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
                      >
                        <div className="avatar avatar-sm">{getInitials(e.author.name)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{e.author.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {e.author.role} · collaborated on {projects.find((p) => p.builderIds.includes(builder.id) && p.builderIds.includes(e.author!.id))?.name ?? "a shared project"}
                          </div>
                        </div>
                        {e.author.verificationStatus === "Verified" && (
                          <ShieldCheck style={{ width: 13, height: 13, color: "var(--accent)", marginLeft: "auto" }} />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Verification status — minimal */}
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: isVerified ? "var(--accent-subtle)" : isPending ? "var(--warning-bg)" : undefined,
              borderColor: isVerified ? "var(--accent-subtle-md)" : isPending ? "var(--warning-border)" : undefined,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: isVerified ? "var(--accent)" : isPending ? "var(--warning-bg)" : "var(--surface-elevated)",
                border: isVerified ? "none" : `1.5px solid ${isPending ? "var(--warning-border)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isVerified
                ? <ShieldCheck style={{ width: 16, height: 16, color: "#fff" }} />
                : isPending
                ? <AlertCircle style={{ width: 15, height: 15, color: "var(--warning)" }} />
                : <AlertCircle style={{ width: 15, height: 15, color: "var(--text-muted)" }} />}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: isVerified ? "var(--accent)" : isPending ? "var(--warning)" : "var(--text-muted)" }}>
                {isVerified ? "BuildHub Verified" : isPending ? "Under Review" : "Not Verified"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {isVerified ? "Admin-reviewed, not self-listed" : isPending ? "Awaiting admin review" : "Self-listed profile"}
              </div>
            </div>
          </div>

          {/* Skills with proof receipts */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 14px" }}>
              Skills — backed by projects
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {builder.skills.map((skill) => {
                const proven = provenSkills.has(skill);
                return (
                  <div
                    key={skill}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: proven ? "var(--success-bg)" : "var(--surface-elevated)",
                      border: `1px solid ${proven ? "var(--success-border)" : "var(--border)"}`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: proven ? "var(--success)" : "var(--text-muted)" }}>
                      {skill}
                    </span>
                    {proven && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--success)" }}>✓ live project</span>
                    )}
                  </div>
                );
              })}
            </div>
            {provenSkills.size < builder.skills.length && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
                Skills marked ✓ are backed by a live shipped product. Others are self-reported.
              </p>
            )}
          </div>

          {/* Collaborators (who they've shipped with) */}
          {collaborators.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <Users style={{ width: 11, height: 11 }} />
                Shipped with
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {collaborators.map((c) => (
                  <Link key={c.id} href={`/builders/${c.username}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div className="avatar avatar-sm">{getInitials(c.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.role}</div>
                    </div>
                    {c.verificationStatus === "Verified" && (
                      <ShieldCheck style={{ width: 12, height: 12, color: "var(--accent)", flexShrink: 0 }} />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Direct contact (Q5) */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 14px" }}>
              Contact directly
            </h3>
            <a
              href={`mailto:${builder.contact}`}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "11px 16px", borderRadius: 11 }}
            >
              <Mail style={{ width: 15, height: 15 }} />
              Send Message
            </a>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
              Direct email. No platform middleman. No bid process.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-grid > div:last-child {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
