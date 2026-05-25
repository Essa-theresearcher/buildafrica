import { useState } from "react";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import {
  Search, ShieldCheck, Zap, ChevronRight, Building2, PlusCircle,
} from "lucide-react";
import { builders, companyRequests } from "@/data/seed";
import { ReputationBadge } from "@/components/builders/ReputationBadge";

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function CompanyPortal() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const [query, setQuery] = useState("");
  const [availFilter, setAvailFilter] = useState<"all" | "Available" | "Limited">("all");

  const filtered = builders.filter((b) => {
    const matchQ =
      !query ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.role.toLowerCase().includes(query.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
      b.location.toLowerCase().includes(query.toLowerCase());
    const matchA = availFilter === "all" || b.availability === availFilter;
    return matchQ && matchA;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>Company Portal</div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>
            Find your builder, {firstName}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "6px 0 0" }}>
            Browse verified builders from the East African tech community.
          </p>
        </div>
        <Link href="/request" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "10px 20px" }}>
          <PlusCircle style={{ width: 14, height: 14 }} /> Post a Hire Request
        </Link>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by name, role, skill or city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%", paddingLeft: 38, paddingRight: 14, height: 42, borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)",
              fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "Available", "Limited"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAvailFilter(f)}
              className={availFilter === f ? "btn btn-primary" : "btn btn-ghost"}
              style={{ fontSize: 13, padding: "9px 16px" }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        {filtered.length} builder{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Builder grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 40 }}>
        {filtered.map((builder) => (
          <Link
            key={builder.id}
            href={`/builders/${builder.username}`}
            className="card card-interactive"
            style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 18, textDecoration: "none" }}
          >
            <div className="avatar avatar-lg gradient-bg" style={{ color: "#fff", fontWeight: 800, flexShrink: 0 }}>
              {getInitials(builder.name)}
            </div>
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
                      : { background: "var(--surface-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }),
                  }}
                >
                  <Zap style={{ width: 9, height: 9 }} /> {builder.availability}
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

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: 15 }}>No builders match your search.</p>
            <button onClick={() => { setQuery(""); setAvailFilter("all"); }} className="btn btn-ghost" style={{ marginTop: 12, fontSize: 13 }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Your posted requests */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
            Your Hire Requests
          </h2>
          <Link href="/request" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Post new request <ChevronRight style={{ width: 13, height: 13 }} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {companyRequests.map((req) => (
            <div key={req.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 style={{ width: 16, height: 16, color: "var(--accent)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{req.companyName}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{req.roleNeeded}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
                {req.timeline}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(req.skillsRequired || []).map((skill) => (
                  <span key={skill} className="badge" style={{ fontSize: 11 }}>{skill}</span>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{req.budgetRange}</span>
                <span className="badge" style={{ fontSize: 10, background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
