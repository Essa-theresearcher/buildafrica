import { useState } from "react";
import { Link } from "wouter";
import { Users, Package, Briefcase, ShieldCheck, CheckCheck, X, ChevronDown, ChevronUp, LayoutDashboard } from "lucide-react";
import { builders, projects, companyRequests, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";
import type { Builder, CompanyRequest } from "../types";

type Tab = "Overview" | "Builders" | "Requests";

function StatCard({ value, label, icon: Icon, color = "var(--accent)", bg = "var(--accent-subtle)" }: {
  value: string | number;
  label: string;
  icon: React.ElementType;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 19, height: 19, color }} />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function BuildersTab() {
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(builders.map((b) => [b.id, b.adminNotes || ""]))
  );
  const [verifs, setVerifs] = useState<Record<string, Builder["verificationStatus"]>>(
    Object.fromEntries(builders.map((b) => [b.id, b.verificationStatus]))
  );
  const [saved, setSaved] = useState<string | null>(null);

  const save = (id: string) => { setSaved(id); setTimeout(() => setSaved(null), 1800); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {builders.map((b) => {
        const shipped = projects.filter((p) => p.builderIds.includes(b.id)).length;
        return (
          <div key={b.id} className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div className="avatar avatar-lg">{getInitials(b.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Link
                    href={`/builders/${b.username}`}
                    style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", textDecoration: "none" }}
                  >
                    {b.name}
                  </Link>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {b.role}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text)", fontWeight: 600 }}>{shipped}</strong> shipped
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {b.tags.slice(0, 3).map((tag) => <ReputationBadge key={tag} tag={tag} />)}
                </div>
              </div>
            </div>

            {/* Verification */}
            <div style={{ marginBottom: 14 }}>
              <label className="label" style={{ marginBottom: 8 }}>Verification Status</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(["Verified", "Pending", "Unverified"] as Builder["verificationStatus"][]).map((v) => {
                  const active = verifs[b.id] === v;
                  const activeStyle = v === "Verified"
                    ? { border: "1.5px solid var(--accent)", background: "var(--accent-subtle)", color: "var(--accent)" }
                    : v === "Pending"
                    ? { border: "1.5px solid var(--warning-border)", background: "var(--warning-bg)", color: "var(--warning)" }
                    : { border: "1.5px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-muted)" };
                  return (
                    <button
                      key={v}
                      onClick={() => setVerifs((prev) => ({ ...prev, [b.id]: v }))}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 14px",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 140ms ease",
                        fontFamily: "inherit",
                        ...(active ? activeStyle : { border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-muted)" }),
                      }}
                    >
                      {v === "Verified" && <CheckCheck style={{ width: 12, height: 12 }} />}
                      {v === "Unverified" && <X style={{ width: 12, height: 12 }} />}
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Admin Notes</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Reliability notes, execution quality, communication..."
                value={notes[b.id]}
                onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                style={{ minHeight: 72 }}
              />
              <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12 }} onClick={() => save(b.id)}>
                {saved === b.id ? "✓ Saved" : "Save notes"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestsTab() {
  const [statuses, setStatuses] = useState<Record<string, CompanyRequest["status"]>>(
    Object.fromEntries(companyRequests.map((r) => [r.id, r.status]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(companyRequests.map((r) => [r.id, r.adminNotes || ""]))
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusColors: Record<CompanyRequest["status"], { bg: string; color: string; border: string }> = {
    New:      { bg: "rgba(59,130,246,0.1)",   color: "#3b82f6",          border: "rgba(59,130,246,0.25)" },
    Reviewed: { bg: "var(--warning-bg)",       color: "var(--warning)",   border: "var(--warning-border)" },
    Matched:  { bg: "var(--success-bg)",       color: "var(--success)",   border: "var(--success-border)" },
    Closed:   { bg: "var(--surface-elevated)", color: "var(--text-muted)",border: "var(--border)" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {companyRequests.map((req) => {
        const sc = statusColors[statuses[req.id]];
        const isOpen = expanded === req.id;
        const matchedBuilders = getBuildersByIds(req.matchedBuilderIds || []);
        return (
          <div key={req.id} className="card" style={{ overflow: "hidden" }}>
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 20, cursor: "pointer" }}
              onClick={() => setExpanded(isOpen ? null : req.id)}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--accent-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                {req.companyName[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{req.companyName}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {req.roleNeeded}</span>
                  <span
                    className="badge"
                    style={{ marginLeft: "auto", background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11 }}
                  >
                    {statuses[req.id]}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                  {req.skillsRequired.map((s) => <span key={s} className="skill-chip">{s}</span>)}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>💰 {req.budgetRange}</span>
                  <span>⏱ {req.timeline}</span>
                  <span>{req.remote ? "🌐 Remote" : `📍 ${req.location}`}</span>
                </div>
              </div>
              {isOpen
                ? <ChevronUp style={{ width: 16, height: 16, color: "var(--text-muted)", flexShrink: 0 }} />
                : <ChevronDown style={{ width: 16, height: 16, color: "var(--text-muted)", flexShrink: 0 }} />
              }
            </div>

            {isOpen && (
              <div style={{ borderTop: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Status */}
                <div>
                  <label className="label">Status</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(["New", "Reviewed", "Matched", "Closed"] as CompanyRequest["status"][]).map((s) => {
                      const c = statusColors[s];
                      const isActive = statuses[req.id] === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setStatuses((prev) => ({ ...prev, [req.id]: s }))}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 9,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: `1.5px solid ${isActive ? c.border : "var(--border)"}`,
                            background: isActive ? c.bg : "transparent",
                            color: isActive ? c.color : "var(--text-muted)",
                            transition: "all 140ms ease",
                            fontFamily: "inherit",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="label">Contact</label>
                  <a
                    href={`mailto:${req.contactEmail}`}
                    style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
                  >
                    {req.contactEmail}
                  </a>
                </div>

                {/* Matched builders */}
                {matchedBuilders.length > 0 && (
                  <div>
                    <label className="label">Matched Builders</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {matchedBuilders.map((b) => (
                        <Link
                          key={b.id}
                          href={`/builders/${b.username}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 12px",
                            borderRadius: 9,
                            background: "var(--accent-subtle)",
                            color: "var(--accent)",
                            textDecoration: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            border: "1px solid var(--accent-subtle-md)",
                          }}
                        >
                          <div className="avatar avatar-sm">{getInitials(b.name)}</div>
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="label">Admin Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Matching notes, intro status, outcome..."
                    value={notes[req.id]}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    style={{ minHeight: 72 }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("Overview");

  const verified = builders.filter((b) => b.verificationStatus === "Verified").length;
  const pending = builders.filter((b) => b.verificationStatus === "Pending").length;
  const newRequests = companyRequests.filter((r) => r.status === "New").length;

  const tabs: Tab[] = ["Overview", "Builders", "Requests"];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LayoutDashboard style={{ width: 20, height: 20, color: "var(--accent)" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Verify builders · match companies · track execution</p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="card"
        style={{ display: "flex", padding: 5, marginBottom: 24, gap: 4 }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: tab === t ? "var(--surface-elevated)" : "transparent",
              color: tab === t ? "var(--text)" : "var(--text-muted)",
              transition: "all 140ms ease",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {t}
            {t === "Builders" && pending > 0 && (
              <span style={{ padding: "1px 6px", borderRadius: 6, background: "var(--warning-bg)", color: "var(--warning)", fontSize: 10, fontWeight: 700 }}>
                {pending}
              </span>
            )}
            {t === "Requests" && newRequests > 0 && (
              <span style={{ padding: "1px 6px", borderRadius: 6, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 10, fontWeight: 700 }}>
                {newRequests}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            <StatCard value={builders.length} label="Total Builders" icon={Users} />
            <StatCard value={verified} label="Verified Builders" icon={ShieldCheck} />
            <StatCard value={projects.length} label="Projects Shipped" icon={Package} />
            <StatCard
              value={newRequests}
              label="New Requests"
              icon={Briefcase}
              color="rgba(59,130,246,0.9)"
              bg="rgba(59,130,246,0.09)"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {/* Pending verifications */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                Pending Verification
                {pending > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 8, background: "var(--warning-bg)", color: "var(--warning)", fontSize: 11, fontWeight: 700 }}>
                    {pending}
                  </span>
                )}
              </h3>
              {builders.filter((b) => b.verificationStatus === "Pending").length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {builders.filter((b) => b.verificationStatus === "Pending").map((b) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar avatar-sm">{getInitials(b.name)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.role}</div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setTab("Builders")}>
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>All builders reviewed. ✓</p>
              )}
            </div>

            {/* New requests */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                New Company Requests
                {newRequests > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 700 }}>
                    {newRequests}
                  </span>
                )}
              </h3>
              {companyRequests.filter((r) => r.status === "New").length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {companyRequests.filter((r) => r.status === "New").map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#3b82f6", flexShrink: 0 }}>
                        {r.companyName[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.companyName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.roleNeeded}</div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setTab("Requests")}>
                        Match
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No new requests.</p>
              )}
            </div>
          </div>

          {/* Recent projects */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 16px" }}>Recent Projects</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {projects.slice(0, 5).map((p, i) => {
                const team = getBuildersByIds(p.builderIds);
                const sc = {
                  Idea: "status-pill status-idea",
                  Building: "status-pill status-building",
                  Launched: "status-pill status-launched",
                  Verified: "status-pill status-verified",
                }[p.status];
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package style={{ width: 15, height: 15, color: "var(--accent)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{team.map((b) => b.name.split(" ")[0]).join(", ")}</div>
                    </div>
                    <span className={sc}>{p.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "Builders" && <BuildersTab />}
      {tab === "Requests" && <RequestsTab />}
    </div>
  );
}
