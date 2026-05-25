import { useState, useEffect, useRef } from "react";
import { Search, Download, X, Check } from "lucide-react";
import { apiFetch } from "../lib/api";

interface WaitlistEntry {
  id: string; email: string; startup_name?: string; startup_name_actual?: string;
  package_interest: string; message?: string; created_at: string;
}
interface ActivePromotion {
  id: string; name: string; slug: string; marketing_tier: string;
  is_featured: boolean; featured_until?: string;
  is_spotlight: boolean; is_startup_of_week: boolean; startup_of_week_date?: string;
}
interface StartupSearchResult {
  id: string; name: string; slug: string; tagline: string; logo_url?: string; category: string; stage: string;
}

const packageLabels: Record<string, string> = {
  featured: "Featured Listing", spotlight: "Homepage Spotlight", startup_of_week: "Startup of the Week", premium: "Premium",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default function AdminMarketing() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [loading, setLoading] = useState(true);

  // SOTW search
  const [sotwQuery, setSotwQuery] = useState("");
  const [sotwResults, setSotwResults] = useState<StartupSearchResult[]>([]);
  const [sotwConfirm, setSotwConfirm] = useState<StartupSearchResult | null>(null);
  const [sotwLoading, setSotwLoading] = useState(false);
  const sotwRef = useRef<ReturnType<typeof setTimeout>>();

  // Manual feature
  const [mfQuery, setMfQuery] = useState("");
  const [mfResults, setMfResults] = useState<StartupSearchResult[]>([]);
  const [mfSelected, setMfSelected] = useState<StartupSearchResult | null>(null);
  const [mfPackage, setMfPackage] = useState("featured");
  const [mfUntil, setMfUntil] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [mfLoading, setMfLoading] = useState(false);
  const [mfSuccess, setMfSuccess] = useState("");
  const mfRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch("/api/marketing/admin/waitlist"),
      apiFetch("/api/marketing/admin/active"),
    ]).then(([wd, pd]) => {
      setWaitlist(wd.waitlist || []);
      setPromotions(pd.promotions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function searchStartups(q: string, setter: (r: StartupSearchResult[]) => void) {
    if (!q.trim()) { setter([]); return; }
    apiFetch(`/api/startups/search?q=${encodeURIComponent(q)}`).then((d) => setter(d.startups || [])).catch(() => {});
  }

  function handleSotwSearch(q: string) {
    setSotwQuery(q);
    clearTimeout(sotwRef.current);
    sotwRef.current = setTimeout(() => searchStartups(q, setSotwResults), 300);
  }

  function handleMfSearch(q: string) {
    setMfQuery(q);
    clearTimeout(mfRef.current);
    mfRef.current = setTimeout(() => searchStartups(q, setMfResults), 300);
  }

  async function handleSetSotw() {
    if (!sotwConfirm) return;
    setSotwLoading(true);
    try {
      await apiFetch("/api/marketing/admin/set-startup-of-week", { method: "POST", body: JSON.stringify({ startup_id: sotwConfirm.id }) });
      setSotwConfirm(null); setSotwQuery(""); setSotwResults([]);
      const pd = await apiFetch("/api/marketing/admin/active");
      setPromotions(pd.promotions || []);
    } catch { } finally { setSotwLoading(false); }
  }

  async function handleRemovePromotion(id: string) {
    try {
      await apiFetch("/api/marketing/admin/remove-promotion", { method: "POST", body: JSON.stringify({ startup_id: id }) });
      setPromotions((p) => p.filter((x) => x.id !== id));
    } catch { }
  }

  async function handleManualFeature() {
    if (!mfSelected) return;
    setMfLoading(true); setMfSuccess("");
    try {
      await apiFetch("/api/marketing/admin/manual-feature", {
        method: "POST",
        body: JSON.stringify({ startup_id: mfSelected.id, package_slug: mfPackage, featured_until: mfUntil }),
      });
      setMfSuccess(`${mfSelected.name} promoted successfully`);
      setMfSelected(null); setMfQuery(""); setMfResults([]);
      const pd = await apiFetch("/api/marketing/admin/active");
      setPromotions(pd.promotions || []);
    } catch { } finally { setMfLoading(false); }
  }

  function downloadWaitlistCsv() {
    const headers = ["Email", "Startup", "Package", "Date", "Message"];
    const rows = waitlist.map((e) => [
      e.email, e.startup_name_actual || e.startup_name || "-",
      packageLabels[e.package_interest] || e.package_interest,
      new Date(e.created_at).toLocaleDateString(),
      (e.message || "").replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "marketing-waitlist.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const sectionStyle: React.CSSProperties = { marginBottom: 40 };
  const sectionHeaderStyle: React.CSSProperties = { fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading admin panel…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 6 }}>Admin</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.03em" }}>Marketing Management</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Manage startup promotions, review waitlist signups, and set featured startups.</p>
      </div>

      {/* Section 1 — Waitlist */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={sectionHeaderStyle}>
            Waitlist <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginLeft: 8 }}>{waitlist.length} signups</span>
          </h2>
          <button className="btn" style={{ padding: "7px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
            onClick={downloadWaitlistCsv}>
            <Download style={{ width: 13, height: 13 }} /> Export CSV
          </button>
        </div>
        {waitlist.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No waitlist entries yet.</div>
        ) : (
          <div className="card" style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Email", "Startup", "Package", "Date", "Message"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waitlist.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 16px", color: "var(--text)", fontWeight: 500 }}>{entry.email}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>{entry.startup_name_actual || entry.startup_name || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "var(--accent-subtle)", color: "var(--accent)" }}>
                        {packageLabels[entry.package_interest] || entry.package_interest}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(entry.created_at)}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 — Active Promotions */}
      <div style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Active Promotions</h2>
        {promotions.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No active promotions.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {promotions.map((p) => (
              <div key={p.id} className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{p.name}</span>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "var(--accent-subtle)", color: "var(--accent)" }}>
                      {p.marketing_tier}
                    </span>
                    {p.featured_until && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        until {new Date(p.featured_until).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePromotion(p.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1px solid #e11d4844", background: "#e11d4811", color: "#e11d48", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <X style={{ width: 13, height: 13 }} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3 — Set Startup of the Week */}
      <div style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Set Startup of the Week</h2>
        <div className="card" style={{ padding: 20 }}>
          {!sotwConfirm ? (
            <>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="Search startup by name…"
                  value={sotwQuery} onChange={(e) => handleSotwSearch(e.target.value)} />
              </div>
              {sotwResults.length > 0 && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  {sotwResults.map((s, i) => (
                    <button key={s.id}
                      onClick={() => setSotwConfirm(s)}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 14px",
                        borderBottom: i < sotwResults.length - 1 ? "1px solid var(--border)" : "none",
                        background: "none", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-elevated)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--accent)", flexShrink: 0 }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.tagline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ padding: 16, borderRadius: 10, background: "var(--surface-elevated)", marginBottom: 14 }}>
                <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Set <strong>{sotwConfirm.name}</strong> as Startup of the Week starting today?</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>This will also enable Featured status for 7 days and clear any existing Startup of the Week.</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary"
                  style={{ padding: "9px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, opacity: sotwLoading ? 0.7 : 1 }}
                  onClick={handleSetSotw} disabled={sotwLoading}>
                  <Check style={{ width: 14, height: 14 }} /> {sotwLoading ? "Setting…" : "Confirm"}
                </button>
                <button className="btn" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => setSotwConfirm(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 4 — Manual Feature */}
      <div style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Manually Feature a Startup</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>For founders who paid via bank transfer or mobile money in early days.</p>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {mfSuccess && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#16a34a11", border: "1px solid #16a34a33", color: "#16a34a", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <Check style={{ width: 14, height: 14 }} /> {mfSuccess}
            </div>
          )}

          {/* Startup search */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Startup</label>
            {mfSelected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--accent)", background: "var(--accent-subtle)" }}>
                <span style={{ flex: 1, fontWeight: 600, color: "var(--text)" }}>{mfSelected.name}</span>
                <button onClick={() => { setMfSelected(null); setMfQuery(""); setMfResults([]); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ) : (
              <>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)" }} />
                  <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="Search startup by name…"
                    value={mfQuery} onChange={(e) => handleMfSearch(e.target.value)} />
                </div>
                {mfResults.length > 0 && (
                  <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginTop: 6 }}>
                    {mfResults.map((s, i) => (
                      <button key={s.id}
                        onClick={() => { setMfSelected(s); setMfQuery(""); setMfResults([]); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 14px",
                          borderBottom: i < mfResults.length - 1 ? "1px solid var(--border)" : "none",
                          background: "none", border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-elevated)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.tagline}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Package</label>
              <select value={mfPackage} onChange={(e) => setMfPackage(e.target.value)}
                style={{ ...inputStyle, appearance: "none" }}>
                <option value="featured">Featured Listing</option>
                <option value="spotlight">Homepage Spotlight</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Featured Until</label>
              <input type="date" value={mfUntil} onChange={(e) => setMfUntil(e.target.value)}
                style={inputStyle} />
            </div>
          </div>

          <button className="btn btn-primary"
            style={{ padding: "10px 24px", fontSize: 14, display: "flex", alignItems: "center", gap: 6, width: "fit-content", opacity: mfLoading ? 0.7 : 1 }}
            onClick={handleManualFeature}
            disabled={mfLoading || !mfSelected}>
            {mfLoading ? "Activating…" : "Activate Promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}
