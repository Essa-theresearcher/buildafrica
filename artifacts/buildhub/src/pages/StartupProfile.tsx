import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowUp, Eye, ExternalLink, Shield, Trophy, Star, Zap, X, ChevronRight, Rocket, Award, Wrench, Search, Megaphone, Clock } from "lucide-react";
import { apiFetch } from "../lib/api";

interface Startup {
  id: string; name: string; slug: string; tagline: string; description: string;
  problem_solved: string; category: string; stage: string; logo_url?: string;
  cover_image_url?: string; demo_url?: string; product_url?: string; github_url?: string;
  looking_for?: string[]; traction_users?: string; traction_revenue?: string;
  markets_served?: string[]; is_hiring: boolean; is_verified: boolean; is_featured: boolean;
  is_spotlight: boolean; spotlight_until?: string; is_startup_of_week: boolean;
  featured_until?: string; total_upvotes: number; total_views: number;
  marketing_tier: string; created_at: string; founder_clerk_id: string;
  team_members: { builder_clerk_id: string; builder_name: string; builder_avatar_url?: string; role: string; is_founder: boolean }[];
}
interface Update {
  id: string; title: string; body: string; update_type: string;
  posted_by_name: string; posted_by_avatar_url?: string; created_at: string;
}

const categoryColors: Record<string, string> = {
  fintech: "#2563eb", edtech: "#16a34a", healthtech: "#dc2626",
  logistics: "#ea580c", saas: "#7c3aed", agritech: "#059669",
  ecommerce: "#ca8a04", developer_tools: "#4b5563", other: "#6b7280",
};
const categoryLabels: Record<string, string> = {
  fintech: "Fintech", edtech: "EdTech", healthtech: "HealthTech",
  logistics: "Logistics", saas: "SaaS", agritech: "AgriTech",
  ecommerce: "eCommerce", developer_tools: "Dev Tools", other: "Other",
};
const stageColors: Record<string, string> = { building: "#6b7280", launched: "#2563eb", growing: "#16a34a" };
const stageLabels: Record<string, string> = { building: "Building", launched: "Launched", growing: "Growing" };

const updateIcons: Record<string, React.ReactNode> = {
  shipped: <Rocket style={{ width: 14, height: 14, color: "#16a34a" }} />,
  milestone: <Award style={{ width: 14, height: 14, color: "#d97706" }} />,
  setback: <Wrench style={{ width: 14, height: 14, color: "#6b7280" }} />,
  looking_for: <Search style={{ width: 14, height: 14, color: "#2563eb" }} />,
  general: <Megaphone style={{ width: 14, height: 14, color: "#7c3aed" }} />,
};
const updateBgColors: Record<string, string> = {
  shipped: "#16a34a22", milestone: "#d9770622", setback: "#6b728022", looking_for: "#2563eb22", general: "#7c3aed22",
};

const lookingForColors: Record<string, string> = {
  "co-founder": "#7c3aed", engineer: "#2563eb", designer: "#db2777",
  "first-users": "#16a34a", feedback: "#6b7280", investment: "#d97706",
};

const tractionUsersLabels: Record<string, string> = {
  "pre-launch": "Pre-launch", "1-100": "Early users (1–100)", "100-500": "Growing (100–500 users)",
  "500-1000": "Scaling (500–1,000 users)", "1000-5000": "Strong traction (1K–5K users)", "5000+": "Significant scale (5K+ users)",
};
const tractionRevenueLabels: Record<string, string> = {
  "pre-revenue": "Pre-revenue", "early-revenue": "Early revenue",
  "growing-revenue": "Growing revenue", "prefer-not-to-say": "Prefer not to say",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function Avatar({ name, url, size = 32 }: { name: string; url?: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>;
}

// ── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({ startup, onClose }: { startup: Startup; onClose: () => void }) {
  const founder = startup.team_members.find((m) => m.is_founder) || startup.team_members[0];
  if (!founder) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>Contact Founder</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: 14, borderRadius: 12, background: "var(--surface-elevated)" }}>
          <Avatar name={founder.builder_name} url={founder.builder_avatar_url} size={44} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{founder.builder_name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{founder.role} · {startup.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href={`https://wa.me/?text=Hi, I found your startup ${startup.name} on BuildHub: ${window.location.href}`}
            target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 12, background: "#25D366", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Chat on WhatsApp
          </a>
          <Link href={`/builders/${founder.builder_name.toLowerCase().replace(/\s+/g, "-")}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
            onClick={onClose}>
            View Builder Profile <ChevronRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Update Form ───────────────────────────────────────────────────────────────
function UpdateForm({ startupId, onSuccess }: { startupId: string; onSuccess: (u: Update) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!title.trim() || body.length < 50) { setError("Title required and body must be at least 50 characters"); return; }
    setSubmitting(true); setError("");
    try {
      const { update } = await apiFetch(`/api/startups/${startupId}/updates`, {
        method: "POST", body: JSON.stringify({ title, body, update_type: type }),
      });
      onSuccess(update);
      setTitle(""); setBody(""); setType("general"); setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to post update");
    } finally { setSubmitting(false); }
  }

  if (!open) return (
    <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
      onClick={() => setOpen(true)}>
      Post Update
    </button>
  );

  return (
    <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--accent)", background: "var(--accent-subtle)", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.entries({ shipped: "🚀 Shipped", milestone: "🏆 Milestone", setback: "🔧 Setback", looking_for: "🔍 Looking For", general: "📢 General" }).map(([v, l]) => (
          <button key={v} onClick={() => setType(v)}
            style={{ padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${type === v ? "var(--accent)" : "var(--border)"}`,
              background: type === v ? "var(--accent)" : "transparent",
              color: type === v ? "#fff" : "var(--text-muted)" }}>
            {l}
          </button>
        ))}
      </div>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, marginBottom: 8, boxSizing: "border-box" }} />
      <textarea placeholder="What happened? (min 50 characters)" value={body} onChange={(e) => setBody(e.target.value)}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, minHeight: 80, resize: "vertical", boxSizing: "border-box" }} />
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{body.length}/1000</div>
      {error && <div style={{ fontSize: 12, color: "#e11d48", marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={submit} disabled={submitting}>
          {submitting ? "Posting…" : "Post Update"}
        </button>
        <button className="btn" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StartupProfile() {
  const { slug } = useParams();
  const { user, isLoaded } = useUser();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [activeTab, setActiveTab] = useState<"updates" | "about" | "jobs">("updates");
  const [showContact, setShowContact] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiFetch(`/api/startups/${slug}`).then((d) => {
      setStartup(d.startup);
      // Record view
      if (!viewRecorded && d.startup) {
        setViewRecorded(true);
        apiFetch(`/api/startups/${d.startup.id}/view`, { method: "POST" }).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!startup) return;
    apiFetch(`/api/startups/${startup.id}/updates`).then((d) => setUpdates(d.updates || [])).catch(() => {});
    if (user) {
      apiFetch(`/api/startups/${startup.id}/upvote-status`).then((d) => setUpvoted(d.upvoted)).catch(() => {});
    }
  }, [startup, user]);

  const handleUpvote = async () => {
    if (!user || !startup) return;
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);
    setStartup((s) => s ? { ...s, total_upvotes: s.total_upvotes + (wasUpvoted ? -1 : 1) } : s);
    try { await apiFetch(`/api/startups/${startup.id}/upvote`, { method: "POST" }); }
    catch { setUpvoted(wasUpvoted); setStartup((s) => s ? { ...s, total_upvotes: s.total_upvotes + (wasUpvoted ? 1 : -1) } : s); }
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading startup…</div>;
  }
  if (!startup) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontWeight: 800, fontSize: 24, color: "var(--text)" }}>Startup not found</h2>
        <Link href="/startups" className="btn btn-primary" style={{ marginTop: 24, display: "inline-flex", padding: "10px 24px" }}>Back to Startups</Link>
      </div>
    );
  }

  const isFounder = isLoaded && user?.id === startup.founder_clerk_id;
  const catColor = categoryColors[startup.category] || "#6b7280";
  const stColor = stageColors[startup.stage] || "#6b7280";

  return (
    <div>
      {showContact && <ContactModal startup={startup} onClose={() => setShowContact(false)} />}

      {/* Startup of the Week Banner */}
      {startup.is_startup_of_week && (
        <div style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed)", color: "#fff", padding: "10px 20px", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
          <Trophy style={{ width: 16, height: 16, color: "#fbbf24" }} />
          BuildHub Startup of the Week
        </div>
      )}

      {/* Spotlight Banner */}
      {startup.is_spotlight && startup.spotlight_until && new Date(startup.spotlight_until) > new Date() && (
        <div style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent)", color: "var(--accent)", padding: "8px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Star style={{ width: 14, height: 14 }} />
          Featured in BuildHub Spotlight this week
        </div>
      )}

      {/* Cover + Hero */}
      <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 28 }}>
        <div style={{
          height: 200, background: startup.cover_image_url ? `url(${startup.cover_image_url}) center/cover` : `linear-gradient(135deg, ${catColor}44, ${catColor}22)`,
          position: "relative",
        }}>
          {startup.logo_url && (
            <img src={startup.logo_url} alt={startup.name}
              style={{ position: "absolute", bottom: -28, left: 24, width: 64, height: 64, borderRadius: 16, objectFit: "cover", border: "3px solid var(--bg)" }} />
          )}
        </div>
        <div style={{ padding: "clamp(16px, 3vw, 28px)", paddingTop: startup.logo_url ? 40 : 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 6px" }}>
                {startup.name}
                {startup.is_startup_of_week && <Trophy style={{ display: "inline", marginLeft: 8, width: 20, height: 20, color: "#fbbf24" }} />}
              </h1>
              <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>{startup.tagline}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: catColor + "22", color: catColor }}>{categoryLabels[startup.category] || startup.category}</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: stColor + "22", color: stColor }}>{stageLabels[startup.stage] || startup.stage}</span>
                {startup.is_verified && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#16a34a22", color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}><Shield style={{ width: 11, height: 11 }} />Verified</span>}
                {startup.is_hiring && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#d9770622", color: "#d97706" }}>Hiring</span>}
                {startup.is_featured && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#7c3aed22", color: "#7c3aed", display: "flex", alignItems: "center", gap: 4 }}><Star style={{ width: 11, height: 11 }} />Featured</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              {isFounder && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/startups/${startup.slug}/promote`}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 9, border: "1px solid #d97706", color: "#d97706", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    <Zap style={{ width: 12, height: 12 }} /> Promote
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
              <Eye style={{ width: 13, height: 13 }} /> {startup.total_views} views
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
              <ArrowUp style={{ width: 13, height: 13 }} /> {startup.total_upvotes} upvotes
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
              <Clock style={{ width: 13, height: 13 }} /> Launched {new Date(startup.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            <button onClick={handleUpvote}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10,
                border: upvoted ? "1.5px solid #7c3aed" : "1px solid var(--border)",
                background: upvoted ? "#7c3aed22" : "transparent",
                color: upvoted ? "#7c3aed" : "var(--text-muted)",
                fontWeight: 700, fontSize: 13, cursor: user ? "pointer" : "default",
              }}>
              <ArrowUp style={{ width: 14, height: 14 }} />
              {upvoted ? "Upvoted" : "Upvote"} · {startup.total_upvotes}
            </button>
            {startup.product_url && (
              <a href={startup.product_url} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                <ExternalLink style={{ width: 13, height: 13 }} /> Visit Product
              </a>
            )}
            {startup.demo_url && (
              <a href={startup.demo_url} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                <ExternalLink style={{ width: 13, height: 13 }} /> View Demo
              </a>
            )}
            <button onClick={() => setShowContact(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
              Contact Founder
            </button>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 24 }} className="startup-layout">

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* About */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>About</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>The Problem</div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{startup.problem_solved}</p>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>The Product</div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{startup.description}</p>
              </div>
              {startup.markets_served && startup.markets_served.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Markets</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {startup.markets_served.map((m) => (
                      <span key={m} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 99, background: "var(--surface-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {startup.github_url && (
                <a href={startup.github_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                  <ExternalLink style={{ width: 11, height: 11 }} /> View on GitHub
                </a>
              )}
            </div>
          </div>

          {/* Looking For */}
          {startup.looking_for && startup.looking_for.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>We are looking for</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {startup.looking_for.map((l) => (
                  <span key={l} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: (lookingForColors[l] || "#6b7280") + "22", color: lookingForColors[l] || "#6b7280", border: `1px solid ${(lookingForColors[l] || "#6b7280")}44` }}>
                    {l.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>The Builders</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {startup.team_members.map((m) => (
                <div key={m.builder_clerk_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={m.builder_name} url={m.builder_avatar_url} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
                      {m.builder_name}
                      {m.is_founder && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "var(--accent-subtle)", color: "var(--accent)" }}>Founder</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traction */}
          {(startup.stage === "launched" || startup.stage === "growing") && (startup.traction_users || startup.traction_revenue) && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>Traction</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {startup.traction_users && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                    <span style={{ color: "var(--text-muted)" }}>Users</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{tractionUsersLabels[startup.traction_users] || startup.traction_users}</span>
                  </div>
                )}
                {startup.traction_revenue && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Revenue</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{tractionRevenueLabels[startup.traction_revenue] || startup.traction_revenue}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {(["updates", "about", "jobs"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  background: "none", border: "none",
                  borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                  color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
                  marginBottom: -1, textTransform: "capitalize",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Updates Tab */}
          {activeTab === "updates" && (
            <div>
              {isFounder && <UpdateForm startupId={startup.id} onSuccess={(u) => setUpdates((prev) => [u, ...prev])} />}
              {updates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  {isFounder
                    ? "Post your first update to show the community what you are building."
                    : "This startup hasn't posted updates yet."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {updates.map((u) => (
                    <div key={u.id} className="card" style={{ padding: 18, borderLeft: `3px solid ${Object.keys(updateBgColors).includes(u.update_type) ? (() => { const m: Record<string, string> = { shipped: "#16a34a", milestone: "#d97706", setback: "#6b7280", looking_for: "#2563eb", general: "#7c3aed" }; return m[u.update_type]; })() : "#7c3aed"}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: updateBgColors[u.update_type] || "#7c3aed22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {updateIcons[u.update_type]}
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0, flex: 1 }}>{u.title}</h4>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 10px" }}>{u.body}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                        <Avatar name={u.posted_by_name} url={u.posted_by_avatar_url} size={20} />
                        {u.posted_by_name} · {timeAgo(u.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>The Problem We Solve</div>
                  <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8, margin: 0 }}>{startup.problem_solved}</p>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Our Product</div>
                  <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8, margin: 0 }}>{startup.description}</p>
                </div>
                {startup.github_url && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Open Source</div>
                    <a href={startup.github_url} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: "var(--accent)", display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                      <ExternalLink style={{ width: 13, height: 13 }} /> {startup.github_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
                {isFounder ? "Post a role to find verified builders." : "No open roles at the moment."}
              </div>
              {isFounder && (
                <Link href="/request" className="btn btn-primary" style={{ padding: "9px 20px", fontSize: 13, display: "inline-flex" }}>
                  Post a Role
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .startup-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
