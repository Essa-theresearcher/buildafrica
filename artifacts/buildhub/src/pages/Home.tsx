import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Package, Users, ChevronRight, Zap, Globe, Trophy, ArrowUp, Eye } from "lucide-react";
import { builders, projects, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";
import { apiFetch } from "../lib/api";

// ── Startups Section (live data) ──────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  fintech: "#2563eb", edtech: "#16a34a", healthtech: "#dc2626",
  logistics: "#ea580c", saas: "#7c3aed", agritech: "#059669",
  ecommerce: "#ca8a04", developer_tools: "#4b5563", other: "#6b7280",
};
const stageLabels: Record<string, string> = { building: "Building", launched: "Launched", growing: "Growing" };

interface HomeStartup {
  id: string; name: string; slug: string; tagline: string; category: string;
  stage: string; logo_url?: string; total_upvotes: number; total_views: number;
  is_startup_of_week: boolean;
}

function StartupsSection() {
  const [startups, setStartups] = useState<HomeStartup[]>([]);
  const [sotw, setSotw] = useState<HomeStartup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/startups?sort=newest").then((d) => {
      const all: HomeStartup[] = d.startups || [];
      setSotw(all.find((s) => s.is_startup_of_week) || null);
      setStartups(all.filter((s) => !s.is_startup_of_week).slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || (startups.length === 0 && !sotw)) {
    return (
      <section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Startups</div>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
              East African startups building now
            </h2>
          </div>
        </div>
        <div className="card" style={{ padding: "clamp(28px, 5vw, 48px)", textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 10 }}>Are you building something?</p>
          <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 14 }}>Showcase your startup to builders, companies, and early users across East Africa.</p>
          <Link href="/startups/new" className="btn btn-primary" style={{ padding: "10px 24px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Zap style={{ width: 14, height: 14 }} /> Add Your Startup
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>Startups</div>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
            East African startups building now
          </h2>
        </div>
        <Link href="/startups" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
          View all startups <ChevronRight style={{ width: 15, height: 15 }} />
        </Link>
      </div>

      {/* Startup of the Week */}
      {sotw && (
        <div style={{
          borderRadius: 20, marginBottom: 20,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)",
          padding: "clamp(20px, 3.5vw, 32px)",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Trophy style={{ width: 14, height: 14, color: "#fbbf24" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em" }}>Startup of the Week</span>
            </div>
            {sotw.logo_url && <img src={sotw.logo_url} alt={sotw.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)", marginBottom: 10 }} />}
            <h3 style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{sotw.name}</h3>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, margin: "0 0 14px", lineHeight: 1.6 }}>{sotw.tagline}</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                {stageLabels[sotw.stage] || sotw.stage}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowUp style={{ width: 11, height: 11 }} /> {sotw.total_upvotes}
              </span>
            </div>
          </div>
          <Link href={`/startups/${sotw.slug}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, background: "#fff", color: "#4f46e5", fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0 }}>
            Discover this startup <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      )}

      {/* Recent startups row */}
      {startups.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {startups.map((s) => {
            const catColor = categoryColors[s.category] || "#6b7280";
            return (
              <Link key={s.id} href={`/startups/${s.slug}`}
                style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: 16, cursor: "pointer", transition: "border-color 200ms" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    {s.logo_url
                      ? <img src={s.logo_url} alt={s.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 8, background: catColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.name[0]}</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: catColor + "22", color: catColor }}>{s.category}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {s.tagline}
                  </p>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><ArrowUp style={{ width: 10, height: 10 }} />{s.total_upvotes}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Eye style={{ width: 10, height: 10 }} />{s.total_views}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
const featuredBuilders = builders.filter((b) => b.verificationStatus === "Verified").slice(0, 4);

const statuses: Record<string, string> = {
  Idea: "status-pill status-idea",
  Building: "status-pill status-building",
  Launched: "status-pill status-launched",
  Verified: "status-pill status-verified",
};

export default function Home() {
  const verifiedCount = builders.filter((b) => b.verificationStatus === "Verified").length;
  const locations = [...new Set(builders.map((b) => b.location.split(",")[0]))];
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            Find East African builders who've actually shipped. Every profile is verified — proof of work over self-promotion.
          </p>

          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Link href="/sign-up" className="btn btn-primary btn-primary-lg">
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

      {/* ── Why BuildHub (quick value strip) ──────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {[
          { icon: ShieldCheck, title: "Verified, not self-reported", desc: "Every builder is reviewed by a human admin before they're listed." },
          { icon: Package, title: "Proof, not portfolios", desc: "Real shipped products with demos and exactly what each person built." },
          { icon: Users, title: "Matched, not flooded", desc: "Companies get hand-picked builders — no 200-bid inboxes." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card" style={{ padding: 24, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon style={{ width: 19, height: 19, color: "var(--accent)" }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 5px", letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          </div>
        ))}
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
              desc: "Real products with demos, tech stack, and exactly what each builder shipped. Not a portfolio — proof.",
              color: "var(--accent)",
              bg: "var(--accent-subtle)",
            },
            {
              step: "02",
              icon: ShieldCheck,
              title: "Admin-verified trust signals",
              desc: "Admins review each builder and assign earned trust tags like Verified Builder and Shipped Project — never self-reported.",
              color: "var(--success)",
              bg: "var(--success-bg)",
            },
            {
              step: "03",
              icon: Users,
              title: "Hand-matched to companies",
              desc: "Tell us what you need. We hand-match you with verified builders who've shipped exactly this kind of product before.",
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

      {/* ── Startups ──────────────────────────────────────────── */}
      <StartupsSection />

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
              BuildHub isn't a cold start. Its first builders already know, ship with, and trust each other — the platform just formalizes that trust instead of manufacturing it.
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

      {/* ── Sticky "Get started" CTA (appears on scroll) ──────── */}
      <Link
        href="/sign-up"
        aria-label="Get started"
        style={{
          position: "fixed",
          right: "clamp(16px, 4vw, 32px)",
          bottom: "clamp(16px, 4vw, 28px)",
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 22px",
          borderRadius: 999,
          background: "var(--gradient)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14.5,
          textDecoration: "none",
          boxShadow: "0 8px 28px rgba(79,70,229,0.4)",
          opacity: showStickyCta ? 1 : 0,
          transform: showStickyCta ? "translateY(0)" : "translateY(16px)",
          pointerEvents: showStickyCta ? "auto" : "none",
          transition: "opacity 240ms ease, transform 240ms ease",
        }}
      >
        Get started <ArrowRight style={{ width: 16, height: 16 }} />
      </Link>

    </div>
  );
}
