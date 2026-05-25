import { useState } from "react";
import { Link } from "wouter";
import { Search, ShieldCheck, MapPin, Briefcase, SlidersHorizontal } from "lucide-react";
import { builders, projects, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";
import type { Builder } from "../types";

function BuilderCard({ builder }: { builder: Builder }) {
  const shipped = projects.filter((p) => p.builderIds.includes(builder.id)).length;

  const availClass = builder.availability === "Available"
    ? "avail-available" : builder.availability === "Limited"
    ? "avail-limited" : "avail-unavail";

  return (
    <Link
      href={`/builders/${builder.username}`}
      className="card card-interactive"
      style={{ display: "flex", flexDirection: "column", padding: 22, textDecoration: "none" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
        <div className="avatar avatar-lg">{getInitials(builder.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", letterSpacing: "-0.01em" }}>
              {builder.name}
            </span>
            {builder.verificationStatus === "Verified" && (
              <ShieldCheck style={{ width: 14, height: 14, color: "var(--accent)", flexShrink: 0 }} />
            )}
            <span className={`badge ${availClass}`} style={{ marginLeft: "auto", fontSize: 11 }}>
              {builder.availability}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
            <Briefcase style={{ width: 12, height: 12, flexShrink: 0 }} />
            {builder.role}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
            <MapPin style={{ width: 11, height: 11, flexShrink: 0 }} />
            {builder.location}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p style={{
        fontSize: 13,
        color: "var(--text-muted)",
        lineHeight: 1.65,
        marginBottom: 16,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        flex: 1,
      }}>
        {builder.bio}
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {builder.skills.slice(0, 4).map((s) => (
          <span key={s} className="skill-chip">{s}</span>
        ))}
        {builder.skills.length > 4 && (
          <span className="skill-chip">+{builder.skills.length - 4}</span>
        )}
      </div>

      {/* Reputation tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
        {builder.tags.slice(0, 3).map((tag) => (
          <ReputationBadge key={tag} tag={tag} />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid var(--border)",
        paddingTop: 14,
        fontSize: 12,
        color: "var(--text-muted)",
      }}>
        <span>
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>{shipped}</strong>{" "}
          project{shipped !== 1 ? "s" : ""} shipped
        </span>
        <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>View profile →</span>
      </div>
    </Link>
  );
}

export default function Builders() {
  const [search, setSearch] = useState("");
  const [filterAvail, setFilterAvail] = useState("all");
  const [filterVerified, setFilterVerified] = useState(false);

  const filtered = builders.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.role.toLowerCase().includes(q) || b.skills.some((s) => s.toLowerCase().includes(q));
    const matchAvail = filterAvail === "all" || b.availability === filterAvail;
    const matchVerify = !filterVerified || b.verificationStatus === "Verified";
    return matchSearch && matchAvail && matchVerify;
  });

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Directory</div>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 10px" }}>
          Builders Directory
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 480 }}>
          Vetted builders who've shipped real products. Every profile reflects actual execution — not a portfolio.
        </p>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{ padding: "16px 20px", marginBottom: 28, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
      >
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--text-muted)" }} />
          <input
            type="search"
            placeholder="Name, role, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
          />
        </div>

        <select
          value={filterAvail}
          onChange={(e) => setFilterAvail(e.target.value)}
          className="input"
          style={{ width: "auto", minWidth: 160, height: 38, fontSize: 13 }}
        >
          <option value="all">All availability</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          <input
            type="checkbox"
            checked={filterVerified}
            onChange={(e) => setFilterVerified(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "var(--accent)", cursor: "pointer" }}
          />
          <ShieldCheck style={{ width: 13, height: 13, color: filterVerified ? "var(--accent)" : "var(--text-muted)" }} />
          Verified only
        </label>

        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>{filtered.length}</strong> builder{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {filtered.map((b) => <BuilderCard key={b.id} builder={b} />)}
        </div>
      ) : (
        <div
          className="card"
          style={{ padding: "60px 24px", textAlign: "center" }}
        >
          <SlidersHorizontal style={{ width: 32, height: 32, color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>No builders match your filters.</p>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => { setSearch(""); setFilterAvail("all"); setFilterVerified(false); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
