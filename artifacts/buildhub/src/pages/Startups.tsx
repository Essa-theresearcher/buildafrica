import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, Eye, ArrowUp, Clock, Zap, ChevronDown, Trophy, Star } from "lucide-react";
import { useUser } from "@clerk/react";
import { apiFetch } from "../lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  stage: string;
  logo_url?: string;
  is_hiring: boolean;
  is_featured: boolean;
  is_startup_of_week: boolean;
  is_spotlight: boolean;
  spotlight_until?: string;
  featured_until?: string;
  total_upvotes: number;
  total_views: number;
  marketing_tier: string;
  created_at: string;
  updated_at: string;
  last_update_at?: string;
  team_members: { builder_clerk_id: string; builder_name: string; builder_avatar_url?: string; is_founder: boolean }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
const stageColors: Record<string, string> = {
  building: "#6b7280", launched: "#2563eb", growing: "#16a34a",
};
const stageLabels: Record<string, string> = {
  building: "Building", launched: "Launched", growing: "Growing",
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function Avatar({ member }: { member: { builder_name: string; builder_avatar_url?: string } }) {
  const initials = member.builder_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (member.builder_avatar_url) {
    return (
      <img src={member.builder_avatar_url} alt={member.builder_name}
        style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--bg)", objectFit: "cover" }} />
    );
  }
  return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--gradient)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function StartupLogo({ startup }: { startup: Pick<Startup, "name" | "category" | "logo_url"> }) {
  const color = categoryColors[startup.category] || "#6b7280";
  const letter = startup.name[0]?.toUpperCase() || "S";
  if (startup.logo_url) {
    return <img src={startup.logo_url} alt={startup.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: 48, height: 48, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {letter}
    </div>
  );
}

// ── Startup Card ──────────────────────────────────────────────────────────────
function StartupCard({ startup, onUpvote, upvotedIds }: {
  startup: Startup;
  onUpvote: (id: string) => void;
  upvotedIds: Set<string>;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { isSignedIn } = useUser();
  const isUpvoted = upvotedIds.has(startup.id);
  const isFeatured = startup.is_featured && startup.featured_until && new Date(startup.featured_until) > new Date();
  const lastUpdate = timeAgo(startup.last_update_at || undefined);

  return (
    <div
      className="card"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        border: isFeatured ? "1.5px solid #7c3aed" : "1px solid var(--border)",
        transition: "border-color 200ms",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {isFeatured && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "#7c3aed", color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <Star style={{ width: 9, height: 9 }} />
          Featured
        </div>
      )}

      <Link href={`/startups/${startup.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <StartupLogo startup={startup} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {startup.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {startup.tagline.slice(0, 80)}{startup.tagline.length > 80 ? "…" : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: categoryColors[startup.category] + "22", color: categoryColors[startup.category] }}>
            {categoryLabels[startup.category] || startup.category}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: stageColors[startup.stage] + "22", color: stageColors[startup.stage] }}>
            {stageLabels[startup.stage] || startup.stage}
          </span>
          {startup.is_hiring && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#d97706" + "22", color: "#d97706" }}>
              Hiring
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {startup.team_members.slice(0, 3).map((m) => (
            <Avatar key={m.builder_clerk_id} member={m} />
          ))}
          {startup.team_members.length > 3 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{startup.team_members.length - 3}</span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Eye style={{ width: 11, height: 11 }} />
            {startup.total_views}
          </span>
          {lastUpdate ? (
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock style={{ width: 11, height: 11 }} />
              {lastUpdate}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>No updates yet</span>
          )}
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isSignedIn) { setShowTooltip(true); setTimeout(() => setShowTooltip(false), 2000); return; }
              onUpvote(startup.id);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 8,
              border: isUpvoted ? "1px solid #7c3aed" : "1px solid var(--border)",
              background: isUpvoted ? "#7c3aed22" : "transparent",
              color: isUpvoted ? "#7c3aed" : "var(--text-muted)",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            <ArrowUp style={{ width: 13, height: 13 }} />
            {startup.total_upvotes}
          </button>
          {showTooltip && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
              background: "#0d0b1e", color: "#fff", fontSize: 12, padding: "4px 10px",
              borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none",
            }}>
              Sign in to upvote
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Startup of the Week Card ──────────────────────────────────────────────────
function StartupOfWeekCard({ startup }: { startup: Startup }) {
  return (
    <div style={{
      borderRadius: 20,
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)",
      padding: "clamp(24px, 4vw, 40px)",
      position: "relative",
      overflow: "hidden",
      marginBottom: 8,
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
        <div style={{ flex: "1 1 300px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Trophy style={{ width: 16, height: 16, color: "#fbbf24" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Startup of the Week
            </span>
          </div>
          {startup.logo_url && <img src={startup.logo_url} alt={startup.name} style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover", marginBottom: 16, border: "3px solid rgba(255,255,255,0.2)" }} />}
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            {startup.name}
            <Trophy style={{ display: "inline", marginLeft: 8, width: 22, height: 22, color: "#fbbf24" }} />
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: "0 0 16px", lineHeight: 1.6 }}>{startup.tagline}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              {stageLabels[startup.stage] || startup.stage}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowUp style={{ width: 11, height: 11 }} />
              {startup.total_upvotes} upvotes
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href={`/startups/${startup.slug}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, background: "#fff", color: "#4f46e5", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              View Startup
            </Link>
            <a
              href={`https://wa.me/?text=Check out ${startup.name} on BuildHub: ${window.location.origin}/startups/${startup.slug}`}
              target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Share on WhatsApp
            </a>
          </div>
        </div>
        {startup.team_members.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>The Team</div>
            <div style={{ display: "flex", gap: -4 }}>
              {startup.team_members.slice(0, 4).map((m) => (
                <div key={m.builder_clerk_id} title={m.builder_name}>
                  {m.builder_avatar_url
                    ? <img src={m.builder_avatar_url} alt={m.builder_name} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", objectFit: "cover", marginRight: -6 }} />
                    : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginRight: -6 }}>
                        {m.builder_name[0]?.toUpperCase()}
                      </div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const categories = [
  { value: "all", label: "All" },
  { value: "fintech", label: "Fintech" },
  { value: "edtech", label: "EdTech" },
  { value: "healthtech", label: "HealthTech" },
  { value: "logistics", label: "Logistics" },
  { value: "saas", label: "SaaS" },
  { value: "agritech", label: "AgriTech" },
  { value: "developer_tools", label: "Dev Tools" },
  { value: "other", label: "Other" },
];

const stages = [
  { value: "all", label: "All" },
  { value: "building", label: "Building" },
  { value: "launched", label: "Launched" },
  { value: "growing", label: "Growing" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "most_upvoted", label: "Most Upvoted" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "hiring", label: "Hiring Now" },
];

export default function Startups() {
  const { isSignedIn } = useUser();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [stats, setStats] = useState({ startup_count: 0, builder_count: 0, launched_count: 0 });
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    apiFetch("/api/startups/stats").then((d) => setStats(d)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      const params = new URLSearchParams({ stage, category, sort, ...(query ? { q: query } : {}) });
      apiFetch(`/api/startups?${params}`).then((d) => {
        setStartups(d.startups || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, 250);
  }, [stage, category, sort, query]);

  const handleUpvote = async (id: string) => {
    if (!isSignedIn) return;
    const wasUpvoted = upvotedIds.has(id);
    // Optimistic update
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (wasUpvoted) next.delete(id); else next.add(id);
      return next;
    });
    setStartups((prev) =>
      prev.map((s) => s.id === id ? { ...s, total_upvotes: s.total_upvotes + (wasUpvoted ? -1 : 1) } : s)
    );
    try {
      await apiFetch(`/api/startups/${id}/upvote`, { method: "POST" });
    } catch {
      // Revert on error
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        if (wasUpvoted) next.add(id); else next.delete(id);
        return next;
      });
      setStartups((prev) =>
        prev.map((s) => s.id === id ? { ...s, total_upvotes: s.total_upvotes + (wasUpvoted ? 1 : -1) } : s)
      );
    }
  };

  const startupOfWeek = startups.find((s) => s.is_startup_of_week);
  const featured = startups.filter((s) => s.is_featured && s.featured_until && new Date(s.featured_until) > new Date() && !s.is_startup_of_week);
  const regular = startups.filter((s) => !s.is_startup_of_week && !(s.is_featured && s.featured_until && new Date(s.featured_until) > new Date()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Header */}
      <div>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Startup Directory</div>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 10px" }}>
          Startups Building in East Africa
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 560, margin: "0 0 20px" }}>
          Discover real products built by African founders. Use them. Support them. Hire their builders.
        </p>
        {/* Stats */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {[
            { label: "Startups", value: stats.startup_count },
            { label: "Builders", value: stats.builder_count },
            { label: "Products Launched", value: stats.launched_count },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{value}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Startup of the Week */}
      {startupOfWeek && <StartupOfWeekCard startup={startupOfWeek} />}

      {/* Featured row */}
      {featured.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Star style={{ width: 15, height: 15, color: "#7c3aed" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Featured This Week</span>
          </div>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {featured.map((s) => (
              <div key={s.id} style={{ minWidth: 280, maxWidth: 300, flexShrink: 0 }}>
                <StartupCard startup={s} onUpvote={handleUpvote} upvotedIds={upvotedIds} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Stage tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {stages.map((s) => (
            <button key={s.value} onClick={() => setStage(s.value)}
              style={{
                padding: "6px 14px", borderRadius: 9, fontSize: 13, fontWeight: 500,
                border: "1px solid var(--border)", cursor: "pointer",
                background: stage === s.value ? "var(--accent)" : "transparent",
                color: stage === s.value ? "#fff" : "var(--text-muted)",
                transition: "all 150ms",
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Category + Sort + Search */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Category scroll */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: "1 1 200px" }}>
            {categories.map((c) => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                  border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap",
                  background: category === c.value ? "var(--accent-subtle)" : "transparent",
                  color: category === c.value ? "var(--accent)" : "var(--text-muted)",
                  flexShrink: 0,
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "7px 30px 7px 12px", borderRadius: 9, fontSize: 13,
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text)", cursor: "pointer", appearance: "none",
              }}>
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: "0 1 240px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search startups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ padding: 20, height: 200, background: "var(--surface-elevated)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : regular.length === 0 && !startupOfWeek && featured.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No startups found for these filters.</p>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Be the first to launch in this category.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setStage("all"); setCategory("all"); setQuery(""); }}
              className="btn" style={{ padding: "9px 20px" }}>Clear filters</button>
            <Link href="/startups/new" className="btn btn-primary" style={{ padding: "9px 20px" }}>Add your startup</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {regular.map((s) => (
            <StartupCard key={s.id} startup={s} onUpvote={handleUpvote} upvotedIds={upvotedIds} />
          ))}
        </div>
      )}

      {/* Add startup CTA */}
      <div className="card" style={{ padding: "28px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>Building something?</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Showcase your startup to builders, companies, and early users across East Africa.</div>
        </div>
        <Link href="/startups/new" className="btn btn-primary" style={{ padding: "10px 22px", fontSize: 14, whiteSpace: "nowrap" }}>
          <Zap style={{ width: 14, height: 14 }} />
          Add Your Startup
        </Link>
      </div>
    </div>
  );
}
