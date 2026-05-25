import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Package, Users, ChevronRight, Zap, Globe } from "lucide-react";
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

const gaps = [
  {
    platform: "Upwork",
    problem: "Zero proof-of-work. A builder with 10 shipped products looks identical to someone who has never shipped anything.",
  },
  {
    platform: "LinkedIn",
    problem: "Rewards connections and self-promotion. No way to verify \"I built this product and it works.\"",
  },
  {
    platform: "Toptal",
    problem: "$60–200/hour. Built for Silicon Valley budgets, not East African startups.",
  },
];

export default function Home() {
  const verifiedCount = builders.filter((b) => b.verificationStatus === "Verified").length;
  const locations = [...new Set(builders.map((b) => b.location.split(",")[0]))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 88 }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="grid-bg"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "clamp(56px, 10vw, 100px) clamp(24px, 6vw, 64px)",
          textAlign: "center",
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 740, margin: "0 auto" }}>
          <div className="section-eyebrow" style={{ marginBottom: 20, justifyContent: "center" }}>
            <Globe style={{ width: 13, height: 13 }} />
            Nairobi · Mogadishu · Kampala · Addis Ababa
          </div>

          <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: "var(--text)", margin: 0 }}>
            East Africa's builders are shipping real products.{" "}
            <span className="gradient-text">Nobody sees them.</span>
          </h1>

          <p style={{ margin: "22px auto 0", fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 540 }}>
            BuildHub is the trust layer that doesn't exist yet — a verified discovery platform where proof of execution beats proof of platform activity. Always.
          </p>

          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Link href="/builders" className="btn btn-primary btn-primary-lg">
              Join as Builder
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/request" className="btn btn-outline btn-outline-lg">
              Hire a Builder
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ display: "flex" }}>
              {builders.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="gradient-bg"
                  title={b.name}
                  style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", marginLeft: -7, border: "2.5px solid var(--surface)" }}
                >
                  {getInitials(b.name)}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text)", fontWeight: 700 }}>{verifiedCount} verified builders</strong> from {locations.join(", ")}
            </span>
          </div>
        </div>
      </section>

      {/* ── The gap ──────────────────────────────────────────── */}
      <section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>The Problem</div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 12px" }}>
            Every existing platform gets this wrong
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
            When a company in Nairobi needs a builder, they post on Upwork and get 200 bids, or ask in WhatsApp and hire whoever responds first.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {gaps.map(({ platform, problem }) => (
            <div
              key={platform}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: "var(--danger-bg)",
                    color: "var(--danger)",
                    border: "1px solid var(--danger-border)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  {platform}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{problem}</p>
            </div>
          ))}
        </div>

        {/* Core principle callout */}
        <div
          style={{
            marginTop: 20,
            borderRadius: 16,
            border: "1.5px solid var(--accent-subtle-md)",
            background: "var(--accent-subtle)",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 11,
              background: "var(--gradient)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            <strong style={{ fontWeight: 800 }}>BuildHub's core principle:</strong>{" "}
            A builder with zero clients but 5 live shipped products is more credible than someone with 50 Upwork jobs and no portfolio. Proof of execution beats proof of platform activity. Always.
          </p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>How BuildHub Works</div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>
            The trust layer East Africa was missing
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              step: "01",
              icon: Package,
              title: "Verified shipped products",
              desc: "Builders document real products with screenshots, demo links, tech stack, and exactly what they personally contributed. Not a portfolio — proof.",
              color: "var(--accent)",
              bg: "var(--accent-subtle)",
            },
            {
              step: "02",
              icon: ShieldCheck,
              title: "Admin-verified trust signals",
              desc: "Admins review builders and assign trust tags: Verified Builder, Reliable Collaborator, Shipped Project. These signals are earned, not self-reported.",
              color: "var(--success)",
              bg: "var(--success-bg)",
            },
            {
              step: "03",
              icon: Users,
              title: "Hand-matched to companies",
              desc: "Companies submit exactly what they need. BuildHub matches them to verified builders who have proof they've shipped exactly this kind of product before.",
              color: "var(--warning)",
              bg: "var(--warning-bg)",
            },
          ].map(({ step, icon: Icon, title, desc, color, bg }) => (
            <div key={step} className="card" style={{ padding: 28, position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--border)", marginBottom: 16, fontVariantNumeric: "tabular-nums" }}>
                {step}
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ─────────────────────────────────── */}
      <section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Shipped Products</div>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
              Real proof. Not portfolios.
            </h2>
          </div>
          <Link href="/projects" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
            View all projects <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {featuredProjects.map((project) => {
            const pBuilders = getBuildersByIds(project.builderIds);
            return (
              <Link key={project.id} href="/projects" className="card card-interactive" style={{ display: "block", padding: 22, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>{project.name}</h3>
                  <span className={statuses[project.status]} style={{ flexShrink: 0 }}>{project.status}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {project.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {project.techStack.slice(0, 3).map((t) => (
                    <span key={t} className="skill-chip">{t}</span>
                  ))}
                  {project.techStack.length > 3 && <span className="skill-chip">+{project.techStack.length - 3}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div style={{ display: "flex" }}>
                    {pBuilders.slice(0, 3).map((b) => (
                      <div key={b.id} className="gradient-bg" style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff", marginLeft: -5, border: "2px solid var(--surface)" }}>
                        {getInitials(b.name)}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {pBuilders.map((b) => b.name.split(" ")[0]).join(" & ")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Builders ─────────────────────────────────── */}
      <section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Verified Builders</div>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
              Known builders. Proven delivery.
            </h2>
          </div>
          <Link href="/builders" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
            View directory <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {featuredBuilders.map((builder) => (
            <Link
              key={builder.id}
              href={`/builders/${builder.username}`}
              className="card card-interactive"
              style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 18, textDecoration: "none" }}
            >
              <div className="avatar avatar-lg">{getInitials(builder.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{builder.name}</span>
                  {builder.verificationStatus === "Verified" && (
                    <ShieldCheck style={{ width: 14, height: 14, color: "var(--accent)", flexShrink: 0 }} />
                  )}
                  <span
                    className="badge"
                    style={{
                      marginLeft: "auto",
                      ...(builder.availability === "Available"
                        ? { background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }
                        : builder.availability === "Limited"
                        ? { background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }
                        : { background: "var(--surface-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                      ),
                    }}
                  >
                    <Zap style={{ width: 9, height: 9 }} />
                    {builder.availability}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px" }}>
                  {builder.role} · {builder.location}
                </p>
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

      {/* ── Community context ────────────────────────────────── */}
      <section>
        <div
          className="card"
          style={{ padding: "clamp(28px, 5vw, 48px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32 }}
        >
          <div style={{ flex: "1 1 280px" }}>
            <div className="section-eyebrow" style={{ marginBottom: 12 }}>Where BuildHub started</div>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text)", margin: "0 0 14px" }}>
              Built on the Coffee & Code community
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              BuildHub is not a cold-start platform. The first builders already know each other, already ship products, and already trust each other. The platform formalizes and amplifies that existing trust — it doesn't try to manufacture it.
            </p>
          </div>
          <div style={{ flex: "0 1 260px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Verified builders", value: `${verifiedCount} active` },
              { label: "Cities covered", value: `${locations.length} across East Africa` },
              { label: "Project verification", value: "Human admin review" },
              { label: "Company matching", value: "Hand-picked, not algorithmic" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        style={{
          borderRadius: 24,
          background: "var(--gradient)",
          padding: "clamp(48px, 8vw, 72px) clamp(24px, 5vw, 56px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 14px" }}>
            Looking for a reliable builder?
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.8vw, 16px)", color: "rgba(255,255,255,0.75)", maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.65 }}>
            Submit what you need. We'll hand-match you with a verified builder who has shipped exactly this kind of product before.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Link
              href="/request"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 14,
                background: "#fff", color: "#3730c4",
                fontWeight: 700, fontSize: 15, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)", letterSpacing: "-0.01em",
              }}
            >
              Submit a Builder Request
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link
              href="/builders"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 24px", borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}
            >
              Browse the Directory
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
