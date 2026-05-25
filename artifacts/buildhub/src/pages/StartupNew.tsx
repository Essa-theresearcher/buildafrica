import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { ChevronRight, ChevronLeft, Check, X, ExternalLink } from "lucide-react";
import { apiFetch } from "../lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type Stage = "building" | "launched" | "growing";
type Category = "fintech" | "edtech" | "healthtech" | "logistics" | "saas" | "agritech" | "ecommerce" | "developer_tools" | "other";

const categoryOptions: { value: Category; label: string; icon: string }[] = [
  { value: "fintech", label: "Fintech", icon: "💳" },
  { value: "edtech", label: "EdTech", icon: "📚" },
  { value: "healthtech", label: "HealthTech", icon: "🏥" },
  { value: "logistics", label: "Logistics", icon: "🚚" },
  { value: "saas", label: "SaaS", icon: "☁️" },
  { value: "agritech", label: "AgriTech", icon: "🌾" },
  { value: "ecommerce", label: "eCommerce", icon: "🛒" },
  { value: "developer_tools", label: "Dev Tools", icon: "⚙️" },
  { value: "other", label: "Other", icon: "🔧" },
];

const stageOptions = [
  { value: "building" as Stage, label: "Building", desc: "I am building. Not launched yet." },
  { value: "launched" as Stage, label: "Launched", desc: "Live product. Early users." },
  { value: "growing" as Stage, label: "Growing", desc: "Real traction. Paying users or significant free user base." },
];

const lookingForOptions = [
  { value: "co-founder", label: "Co-founder", color: "#7c3aed" },
  { value: "engineer", label: "Engineer", color: "#2563eb" },
  { value: "designer", label: "Designer", color: "#db2777" },
  { value: "first-users", label: "First Users", color: "#16a34a" },
  { value: "feedback", label: "Feedback", color: "#6b7280" },
  { value: "investment", label: "Investment", color: "#d97706" },
];

const tractionUsersOptions = [
  { value: "pre-launch", label: "Pre-launch" },
  { value: "1-100", label: "Early users (1–100)" },
  { value: "100-500", label: "Growing (100–500)" },
  { value: "500-1000", label: "Scaling (500–1k)" },
  { value: "1000-5000", label: "Strong (1K–5K)" },
  { value: "5000+", label: "Significant (5K+)" },
];

const tractionRevenueOptions = [
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "early-revenue", label: "Early revenue" },
  { value: "growing-revenue", label: "Growing revenue" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 50);
}

function validateUrl(url: string) {
  if (!url) return true;
  try { new URL(url.startsWith("http") ? url : `https://${url}`); return true; } catch { return false; }
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</label>
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: "#e11d48" }}>{error}</span>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid var(--border)", background: "var(--surface)",
  color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box",
};

export default function StartupNew() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugCheckRef = useRef<ReturnType<typeof setTimeout>>();
  const [marketTag, setMarketTag] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "", slug: "", tagline: "", category: "" as Category, stage: "" as Stage,
    problem_solved: "", description: "", demo_url: "", product_url: "", github_url: "",
    looking_for: [] as string[], traction_users: "", traction_revenue: "",
    markets_served: [] as string[], is_hiring: false,
    logo_url: "", cover_image_url: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isLoaded) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  if (!isSignedIn) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>Sign in to add your startup</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>You need a BuildHub account to showcase your startup.</p>
        <a href="/sign-in" className="btn btn-primary" style={{ padding: "10px 24px" }}>Sign In</a>
      </div>
    );
  }

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function handleNameChange(name: string) {
    set("name", name);
    const slug = slugify(name);
    set("slug", slug);
    checkSlug(slug);
  }

  function checkSlug(slug: string) {
    if (!slug) { setSlugAvailable(null); return; }
    clearTimeout(slugCheckRef.current);
    setSlugChecking(true);
    slugCheckRef.current = setTimeout(async () => {
      try {
        const d = await apiFetch("/api/startups/check-slug", { method: "POST", body: JSON.stringify({ slug }) });
        setSlugAvailable(d.available);
      } catch { setSlugAvailable(null); } finally { setSlugChecking(false); }
    }, 400);
  }

  function addMarket() {
    const v = marketTag.trim();
    if (v && !form.markets_served.includes(v)) {
      set("markets_served", [...form.markets_served, v]);
    }
    setMarketTag("");
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Startup name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (slugAvailable === false) e.slug = "This name is taken. Try another.";
    if (!form.tagline.trim()) e.tagline = "Tagline is required";
    if (form.tagline.length > 100) e.tagline = "Max 100 characters";
    if (!form.category) e.category = "Choose a category";
    if (!form.stage) e.stage = "Choose a stage";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.problem_solved.trim() || form.problem_solved.length < 100) e.problem_solved = "Describe the problem in at least 100 characters";
    if (!form.description.trim() || form.description.length < 100) e.description = "Describe your product in at least 100 characters";
    if (form.demo_url && !validateUrl(form.demo_url)) e.demo_url = "Enter a valid URL";
    if (form.product_url && !validateUrl(form.product_url)) e.product_url = "Enter a valid URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        ...form,
        demo_url: form.demo_url ? (form.demo_url.startsWith("http") ? form.demo_url : `https://${form.demo_url}`) : "",
        product_url: form.product_url ? (form.product_url.startsWith("http") ? form.product_url : `https://${form.product_url}`) : "",
      };
      const { startup } = await apiFetch("/api/startups", { method: "POST", body: JSON.stringify(payload) });
      setLocation(`/startups/${startup.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create startup";
      if (msg.includes("already have a startup")) {
        setSubmitError("You already have a startup on BuildHub.");
      } else {
        setSubmitError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const steps = ["Basics", "Story", "Team & Media"];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.03em" }}>
        Add Your Startup
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>
        Showcase what you're building to the BuildHub community.
      </p>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: step > i + 1 ? "#16a34a" : step === i + 1 ? "var(--accent)" : "var(--surface-elevated)",
                border: `2px solid ${step > i + 1 ? "#16a34a" : step === i + 1 ? "var(--accent)" : "var(--border)"}`,
                color: step >= i + 1 ? "#fff" : "var(--text-muted)",
                fontWeight: 700, fontSize: 13, transition: "all 200ms",
              }}>
                {step > i + 1 ? <Check style={{ width: 14, height: 14 }} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: step === i + 1 ? "var(--accent)" : "var(--text-muted)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > i + 1 ? "#16a34a" : "var(--border)", margin: "0 8px 20px", transition: "background 200ms" }} />
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "clamp(20px, 4vw, 36px)" }}>

        {/* ── STEP 1 ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Field label="Startup Name *" error={errors.name}>
              <input style={inputStyle} placeholder="e.g. DukaFlow" value={form.name}
                onChange={(e) => handleNameChange(e.target.value)} />
            </Field>

            <Field label="URL Slug *" error={errors.slug}>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputStyle, paddingRight: 110 }}
                  placeholder="your-startup"
                  value={form.slug}
                  onChange={(e) => { set("slug", e.target.value); checkSlug(e.target.value); }}
                />
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  fontSize: 11, color: slugChecking ? "var(--text-muted)" : slugAvailable === true ? "#16a34a" : slugAvailable === false ? "#e11d48" : "var(--text-muted)",
                  fontWeight: 600,
                }}>
                  {slugChecking ? "checking…" : slugAvailable === true ? "✓ available" : slugAvailable === false ? "✗ taken" : ""}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>buildhub.com/startups/{form.slug || "your-slug"}</span>
            </Field>

            <Field label="Tagline *" error={errors.tagline} hint={`${form.tagline.length}/100 characters`}>
              <input style={inputStyle} placeholder="One sentence. What do you do?" value={form.tagline} maxLength={100}
                onChange={(e) => set("tagline", e.target.value)} />
            </Field>

            <Field label="Category *" error={errors.category}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {categoryOptions.map((c) => (
                  <button key={c.value} type="button" onClick={() => set("category", c.value)}
                    style={{
                      padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                      border: `1.5px solid ${form.category === c.value ? "var(--accent)" : "var(--border)"}`,
                      background: form.category === c.value ? "var(--accent-subtle)" : "transparent",
                      color: form.category === c.value ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Stage *" error={errors.stage}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stageOptions.map((s) => (
                  <button key={s.value} type="button" onClick={() => set("stage", s.value)}
                    style={{
                      padding: "12px 16px", borderRadius: 10, textAlign: "left",
                      border: `1.5px solid ${form.stage === s.value ? "var(--accent)" : "var(--border)"}`,
                      background: form.stage === s.value ? "var(--accent-subtle)" : "transparent",
                      cursor: "pointer",
                    }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: form.stage === s.value ? "var(--accent)" : "var(--text)" }}>
                      {form.stage === s.value && <Check style={{ display: "inline", width: 13, height: 13, marginRight: 6 }} />}
                      {s.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </Field>

            <button className="btn btn-primary"
              style={{ padding: "11px 24px", display: "flex", alignItems: "center", gap: 6, width: "fit-content", marginTop: 8 }}
              onClick={() => { if (validateStep1()) setStep(2); }}>
              Continue <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Field label="The Problem *" error={errors.problem_solved} hint={`${form.problem_solved.length} chars (min 100)`}>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                placeholder="What specific problem do you solve? Who in East Africa has this problem? How are they dealing with it today?"
                value={form.problem_solved}
                onChange={(e) => set("problem_solved", e.target.value)} />
            </Field>

            <Field label="The Product *" error={errors.description} hint={`${form.description.length} chars (min 100)`}>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                placeholder="Describe your product. What does it do? How does it work?"
                value={form.description}
                onChange={(e) => set("description", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Demo URL" error={errors.demo_url}>
                <input style={inputStyle} placeholder="https://demo.yourapp.com"
                  value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)} />
              </Field>
              <Field label="Product URL">
                <input style={inputStyle} placeholder="https://yourapp.com"
                  value={form.product_url} onChange={(e) => set("product_url", e.target.value)} />
              </Field>
              <Field label="GitHub URL">
                <input style={inputStyle} placeholder="https://github.com/you/repo"
                  value={form.github_url} onChange={(e) => set("github_url", e.target.value)} />
              </Field>
            </div>

            <Field label="Looking For">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {lookingForOptions.map((o) => {
                  const selected = form.looking_for.includes(o.value);
                  return (
                    <button key={o.value} type="button"
                      onClick={() => set("looking_for", selected
                        ? form.looking_for.filter((v) => v !== o.value)
                        : [...form.looking_for, o.value])}
                      style={{
                        padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                        border: `1.5px solid ${selected ? o.color : "var(--border)"}`,
                        background: selected ? o.color + "22" : "transparent",
                        color: selected ? o.color : "var(--text-muted)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      }}>
                      {selected && <Check style={{ width: 12, height: 12 }} />}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            {(form.stage === "launched" || form.stage === "growing") && (
              <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Traction</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Users">
                    <select style={{ ...inputStyle, appearance: "none" }} value={form.traction_users} onChange={(e) => set("traction_users", e.target.value)}>
                      <option value="">Select range</option>
                      {tractionUsersOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Revenue">
                    <select style={{ ...inputStyle, appearance: "none" }} value={form.traction_revenue} onChange={(e) => set("traction_revenue", e.target.value)}>
                      <option value="">Select range</option>
                      {tractionRevenueOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Markets Served" hint="Press Enter or comma to add">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    {form.markets_served.map((m) => (
                      <span key={m} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, background: "var(--accent-subtle)", color: "var(--accent)", fontSize: 12, fontWeight: 500 }}>
                        {m}
                        <button type="button" onClick={() => set("markets_served", form.markets_served.filter((v) => v !== m))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", lineHeight: 1, padding: 0 }}>
                          <X style={{ width: 10, height: 10 }} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input style={inputStyle} placeholder="e.g. Kenya, Uganda, Tanzania"
                    value={marketTag}
                    onChange={(e) => setMarketTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addMarket(); } }}
                    onBlur={addMarket}
                  />
                </Field>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn" style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setStep(1)}>
                <ChevronLeft style={{ width: 15, height: 15 }} /> Back
              </button>
              <button className="btn btn-primary" style={{ padding: "11px 24px", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => { if (validateStep2()) setStep(3); }}>
                Continue <ChevronRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Field label="Logo URL" hint="Paste a direct URL to your logo image (PNG, SVG, or JPG)">
              <input style={inputStyle} placeholder="https://yourapp.com/logo.png"
                value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} />
              {form.logo_url && (
                <img src={form.logo_url} alt="Logo preview" onError={(e) => (e.currentTarget.style.display = "none")}
                  style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border)", marginTop: 6 }} />
              )}
            </Field>

            <Field label="Cover Image URL" hint="Wide banner image for your profile (1200×300 recommended)">
              <input style={inputStyle} placeholder="https://yourapp.com/cover.jpg"
                value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} />
              {form.cover_image_url && (
                <img src={form.cover_image_url} alt="Cover preview" onError={(e) => (e.currentTarget.style.display = "none")}
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)", marginTop: 6 }} />
              )}
            </Field>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>We're Hiring</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Show an amber "Hiring" badge on your startup card</div>
                </div>
                <button type="button" onClick={() => set("is_hiring", !form.is_hiring)}
                  style={{
                    width: 44, height: 24, borderRadius: 99,
                    background: form.is_hiring ? "var(--accent)" : "var(--border)",
                    border: "none", cursor: "pointer", position: "relative", transition: "background 200ms",
                  }}>
                  <div style={{
                    position: "absolute", top: 2, left: form.is_hiring ? 22 : 2,
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    transition: "left 200ms",
                  }} />
                </button>
              </div>
              {form.is_hiring && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, padding: "8px 12px", background: "var(--surface-elevated)", borderRadius: 8 }}>
                  Add roles after creating your profile via the Company Request form.
                </p>
              )}
            </div>

            {/* Summary */}
            <div style={{ padding: 16, borderRadius: 12, background: "var(--surface-elevated)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Ready to launch</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  ["Name", form.name],
                  ["URL", `buildhub.com/startups/${form.slug}`],
                  ["Stage", form.stage],
                  ["Category", form.category],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <span style={{ fontWeight: 500, color: "var(--text)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {submitError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "#e11d4811", border: "1px solid #e11d4833", color: "#e11d48", fontSize: 14 }}>{submitError}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn" style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setStep(2)}>
                <ChevronLeft style={{ width: 15, height: 15 }} /> Back
              </button>
              <button className="btn btn-primary"
                style={{ padding: "11px 24px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: submitting ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}>
                {submitting ? "Launching…" : (
                  <><ExternalLink style={{ width: 14, height: 14 }} /> Launch My Startup on BuildHub</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
