import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useUser } from "@clerk/react";
import { Zap, Check, X, Eye, ArrowUp, Star, Trophy } from "lucide-react";
import { apiFetch } from "../lib/api";

interface Startup {
  id: string; name: string; slug: string; marketing_tier: string;
  is_featured: boolean; featured_until?: string;
  is_spotlight: boolean; spotlight_until?: string;
  is_startup_of_week: boolean; total_views: number; total_upvotes: number;
  founder_clerk_id: string;
}
interface Package {
  id: string; name: string; slug: string; tagline: string;
  description: string; features: string[]; price_usd: number; duration_days: number;
}

const tierLabels: Record<string, string> = {
  free: "Free", featured: "Featured", spotlight: "Spotlight", premium: "Premium",
};

function WaitlistModal({ pkg, startup, email, onClose }: {
  pkg: Package; startup: Startup; email: string; onClose: () => void;
}) {
  const [userEmail, setUserEmail] = useState(email);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!userEmail.includes("@")) { setError("Please enter a valid email"); return; }
    setSubmitting(true); setError("");
    try {
      await apiFetch("/api/marketing/waitlist", {
        method: "POST",
        body: JSON.stringify({
          email: userEmail,
          startup_id: startup.id,
          startup_name: startup.name,
          package_interest: pkg.slug,
          message: message || null,
        }),
      });
      // Store in localStorage so button shows "On the waitlist ✓"
      const key = `waitlist_${startup.id}_${pkg.slug}`;
      localStorage.setItem(key, "1");
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join waitlist");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 20, padding: "clamp(20px, 4vw, 32px)", width: "100%", maxWidth: 460, border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap style={{ width: 18, height: 18, color: "#d97706" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.06em" }}>{pkg.name}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        {!submitted ? (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              You are early — and that is a good thing.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
              Paid marketing is launching soon on BuildHub. Join the waitlist and you will be the first to activate this when it goes live. Early waitlist members get their first week free.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                  Anything you want us to know? <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Which package interests you most? What would make this valuable for your startup?"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, minHeight: 80, resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              {error && <div style={{ fontSize: 12, color: "#e11d48" }}>{error}</div>}
              <button
                className="btn btn-primary"
                style={{ padding: "11px 24px", fontSize: 14, width: "100%", opacity: submitting ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}>
                {submitting ? "Joining…" : "Join the Waitlist"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#16a34a22", border: "2px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Check style={{ width: 24, height: 24, color: "#16a34a" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 8px" }}>You are on the list.</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 4px" }}>
              We will email you at <strong>{userEmail}</strong> when paid marketing goes live.
            </p>
            <p style={{ fontSize: 14, color: "#16a34a", fontWeight: 600, margin: "0 0 24px" }}>Your first week is on us.</p>
            <button className="btn" style={{ padding: "9px 24px" }} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StartupPromote() {
  const { slug } = useParams();
  const { user, isLoaded } = useUser();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [waitlistDone, setWaitlistDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      apiFetch(`/api/startups/${slug}`),
      apiFetch("/api/marketing/packages"),
    ]).then(([sd, pd]) => {
      setStartup(sd.startup);
      setPackages(pd.packages || []);
      // Load localStorage waitlist state
      if (sd.startup) {
        const done: Record<string, boolean> = {};
        (pd.packages || []).forEach((p: Package) => {
          if (localStorage.getItem(`waitlist_${sd.startup.id}_${p.slug}`)) done[p.slug] = true;
        });
        setWaitlistDone(done);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (!isLoaded || loading) return <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  if (!startup || (isLoaded && user?.id !== startup.founder_clerk_id)) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontWeight: 800, fontSize: 24, color: "var(--text)" }}>Access denied</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Only the startup founder can access this page.</p>
      </div>
    );
  }

  const expiryDate = startup.featured_until
    ? new Date(startup.featured_until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {selectedPkg && startup && user && (
        <WaitlistModal
          pkg={selectedPkg}
          startup={startup}
          email={user.emailAddresses?.[0]?.emailAddress || ""}
          onClose={() => {
            setSelectedPkg(null);
            // Refresh waitlist state
            const done: Record<string, boolean> = {};
            packages.forEach((p) => {
              if (localStorage.getItem(`waitlist_${startup.id}_${p.slug}`)) done[p.slug] = true;
            });
            setWaitlistDone(done);
          }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Zap style={{ width: 18, height: 18, color: "#d97706" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>Paid Marketing</span>
        </div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 10px" }}>
          Get More Eyes on {startup.name}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 520 }}>
          Reach builders, companies, and early users who are already looking for products like yours.
        </p>
      </div>

      {/* Current status */}
      <div className="card" style={{ padding: 20, marginBottom: 32, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        <div style={{ flex: "1 1 160px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Current Tier</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: startup.marketing_tier === "free" ? "var(--text-muted)" : "var(--accent)" }}>
            {tierLabels[startup.marketing_tier] || startup.marketing_tier}
          </div>
          {expiryDate && startup.marketing_tier !== "free" && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Expires {expiryDate}</div>
          )}
        </div>
        <div style={{ flex: "1 1 120px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Total Views</div>
          <div style={{ fontWeight: 700, fontSize: 24, color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Eye style={{ width: 18, height: 18 }} /> {startup.total_views}
          </div>
        </div>
        <div style={{ flex: "1 1 120px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Upvotes</div>
          <div style={{ fontWeight: 700, fontSize: 24, color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ArrowUp style={{ width: 18, height: 18 }} /> {startup.total_upvotes}
          </div>
        </div>
      </div>

      {/* Package cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {packages.map((pkg, idx) => {
          const isPopular = idx === 1;
          const isDone = waitlistDone[pkg.slug];
          return (
            <div key={pkg.id}
              style={{
                borderRadius: 16,
                border: isPopular ? "2px solid #7c3aed" : "1px solid var(--border)",
                background: "var(--surface)",
                padding: 24,
                position: "relative",
                transform: isPopular ? "scale(1.02)" : "scale(1)",
                display: "flex", flexDirection: "column",
              }}>
              {isPopular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 700,
                  padding: "3px 12px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Star style={{ width: 10, height: 10 }} /> Most Popular
                </div>
              )}

              <div style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {idx === 0 && <Star style={{ width: 16, height: 16, color: "#d97706" }} />}
                  {idx === 1 && <Zap style={{ width: 16, height: 16, color: "#7c3aed" }} />}
                  {idx === 2 && <Trophy style={{ width: 16, height: 16, color: "#d97706" }} />}
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{pkg.name}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em" }}>${pkg.price_usd}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 4 }}>/ week</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>{pkg.tagline}</div>
              </div>

              <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {(pkg.features as string[]).map((f, fi) => (
                  <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text)" }}>
                    <Check style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isDone && setSelectedPkg(pkg)}
                disabled={isDone}
                style={{
                  width: "100%", padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: isDone ? "default" : "pointer",
                  background: isDone ? "var(--surface-elevated)" : isPopular ? "#7c3aed" : "var(--accent)",
                  color: isDone ? "var(--text-muted)" : "#fff",
                  border: "none", transition: "all 150ms",
                }}>
                {isDone ? "On the waitlist ✓" : `Get ${pkg.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 24 }}>
        All paid features are coming soon. Joining the waitlist gets you <strong>first access + your first week free</strong>.
      </p>
    </div>
  );
}
