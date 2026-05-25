import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Package, Users, Star, ChevronRight, Zap } from "lucide-react";
import { builders, projects, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
const featuredBuilders = builders.filter((b) => b.verificationStatus === "Verified").slice(0, 4);

const statuses: Record<string, string> = {
  Idea: "status-pill status-idea",
  Building: "status-pill status-building",
  Launched: "status-pill status-launched",
  Verified: "status-pill status-verified",
};

function Stat({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div
      className="card"
      style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--accent-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 20, height: 20, color: "var(--accent)" }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="grid-bg"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "88px 48px",
          textAlign: "center",
        }}
      >
        {/* Glow orbs */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div className="section-eyebrow" style={{ marginBottom: 20, justifyContent: "center" }}>
            <ShieldCheck style={{ width: 13, height: 13 }} />
            Trusted Builder Discovery · Nairobi, Kenya
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 58px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Prove execution.{" "}
            <span className="gradient-text">Get discovered.</span>
          </h1>

          <p
            style={{
              marginTop: 20,
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "var(--text-muted)",
              lineHeight: 1.65,
              maxWidth: 520,
              margin: "20px auto 0",
            }}
          >
            BuildHub is where serious builders prove their track record through shipped products, verified profiles, and real collaboration history.
          </p>

          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Link href="/builders" className="btn btn-primary btn-primary-lg">
              Join as Builder
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/builders" className="btn btn-outline btn-outline-lg">
              Find Builders
            </Link>
          </div>

          {/* Social proof */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", marginRight: 4 }}>
              {["DK", "AO", "BO", "GW"].map((init) => (
                <div
                  key={init}
                  className="gradient-bg"
                  style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                    marginLeft: -6,
                    border: "2px solid var(--surface)",
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text)", fontWeight: 600 }}>6 verified builders</strong> from Nairobi already building
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <Stat value="6" label="Verified Builders" icon={ShieldCheck} />
        <Stat value="6" label="Projects Shipped" icon={Package} />
        <Stat value="12+" label="Companies Served" icon={Users} />
        <Stat value="100%" label="Execution Rate" icon={Star} />
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>
            Why BuildHub
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>
            Rewarding proof of work,{" "}
            <span className="gradient-text">not self-promotion</span>
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, color: "var(--text-muted)", maxWidth: 460, margin: "12px auto 0", lineHeight: 1.65 }}>
            Every signal answers one question: can this person build and deliver reliably?
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              icon: ShieldCheck,
              title: "Verified Execution",
              desc: "Builders are verified based on shipped projects and collaboration track records — not resumes.",
              color: "var(--accent)",
              bg: "var(--accent-subtle)",
            },
            {
              icon: Users,
              title: "Collaboration History",
              desc: "See who has shipped products together. Team track records matter as much as individual output.",
              color: "var(--success)",
              bg: "var(--success-bg)",
            },
            {
              icon: Package,
              title: "Shipped Projects",
              desc: "Every project includes tech stack, detailed contribution breakdown, and live demo links.",
              color: "var(--warning)",
              bg: "var(--warning-bg)",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card" style={{ padding: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 8px" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ─────────────────────────────────── */}
      <section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 6 }}>Featured Projects</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
              Real products, verified execution
            </h2>
          </div>
          <Link href="/projects" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
            View all <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {featuredProjects.map((project) => {
            const pBuilders = getBuildersByIds(project.builderIds);
            return (
              <Link key={project.id} href="/projects" className="card card-interactive" style={{ display: "block", padding: 22, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>{project.name}</h3>
                  <span className={statuses[project.status]}>{project.status}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {project.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {project.techStack.slice(0, 3).map((t) => (
                    <span key={t} className="skill-chip">{t}</span>
                  ))}
                  {project.techStack.length > 3 && <span className="skill-chip">+{project.techStack.length - 3}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div style={{ display: "flex" }}>
                    {pBuilders.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="gradient-bg"
                        style={{
                          width: 24, height: 24, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 8, fontWeight: 700, color: "#fff",
                          marginLeft: -5,
                          border: "2px solid var(--surface)",
                        }}
                      >
                        {getInitials(b.name)}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {pBuilders.map((b) => b.name.split(" ")[0]).join(", ")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Builders ─────────────────────────────────── */}
      <section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 6 }}>Verified Builders</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
              Community-verified, ready to build
            </h2>
          </div>
          <Link href="/builders" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
            View all <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {featuredBuilders.map((builder) => (
            <Link
              key={builder.id}
              href={`/builders/${builder.username}`}
              className="card card-interactive"
              style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 20, textDecoration: "none" }}
            >
              <div className="avatar avatar-lg" style={{ fontSize: 20 }}>
                {getInitials(builder.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{builder.name}</span>
                  {builder.verificationStatus === "Verified" && (
                    <ShieldCheck style={{ width: 14, height: 14, color: "var(--accent)", flexShrink: 0 }} />
                  )}
                  <span
                    className={`badge ${builder.availability === "Available" ? "badge-reliable" : builder.availability === "Limited" ? "badge-available" : ""}`}
                    style={{ marginLeft: "auto" }}
                  >
                    <Zap style={{ width: 9, height: 9 }} />
                    {builder.availability}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 10px" }}>{builder.role} · {builder.location.split(",")[0]}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {builder.tags.slice(0, 2).map((tag) => (
                    <ReputationBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        style={{
          borderRadius: 24,
          background: "var(--gradient)",
          padding: "64px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }} />
        <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
          Looking for a reliable builder?
        </h2>
        <p style={{ marginTop: 12, fontSize: 15, color: "rgba(255,255,255,0.75)", maxWidth: 420, margin: "12px auto 0" }}>
          Submit your requirements. We'll match you with the right verified builder from our community.
        </p>
        <Link
          href="/request"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 32,
            padding: "13px 28px",
            borderRadius: 14,
            background: "#fff",
            color: "var(--accent-dark)",
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            letterSpacing: "-0.01em",
          }}
        >
          Submit a Builder Request
          <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </section>

    </div>
  );
}
