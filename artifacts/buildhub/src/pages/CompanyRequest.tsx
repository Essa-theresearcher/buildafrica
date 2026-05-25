import { useState } from "react";
import { CheckCircle, ArrowRight, X } from "lucide-react";

const budgets = [
  "Under $1,000/month",
  "$1,000–$2,500/month",
  "$2,500–$5,000/month",
  "$5,000–$10,000/month",
  "$10,000+/month",
  "Project-based (fixed fee)",
];

const timelines = ["Immediately", "Within 2 weeks", "Within 1 month", "1–3 months", "Flexible"];

const skillSuggestions = [
  "React", "Node.js", "Python", "TypeScript", "PostgreSQL",
  "React Native", "Django", "FastAPI", "Figma", "AWS",
  "Docker", "M-Pesa", "Firebase", "Supabase", "Next.js",
  "Flutter", "GraphQL", "Tailwind CSS",
];

const steps = ["Company", "Role", "Logistics"];

export default function CompanyRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactEmail: "",
    roleNeeded: "",
    skillsRequired: [] as string[],
    budgetRange: "",
    remote: true,
    location: "",
    timeline: "",
  });

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !form.skillsRequired.includes(trimmed)) {
      setForm((f) => ({ ...f, skillsRequired: [...f.skillsRequired, trimmed] }));
    }
    setSkillInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 16px" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle style={{ width: 32, height: 32, color: "var(--success)" }} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Request Submitted
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
          Thanks, <strong style={{ color: "var(--text)" }}>{form.companyName}</strong>. We'll match you with the best verified builders and reach out to <strong style={{ color: "var(--text)" }}>{form.contactEmail}</strong> within 2–3 business days.
        </p>
        <button className="btn btn-outline" style={{ marginTop: 32 }} onClick={() => { setSubmitted(false); setStep(0); }}>
          Submit Another Request
        </button>
      </div>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ padding: 28, marginBottom: 20 }}>
      <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 20px" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Companies</div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 10px" }}>
          Hire a Builder
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, maxWidth: 460 }}>
          Tell us what you need. We'll hand-match you with a verified builder who has shipped exactly this kind of product.
        </p>
      </div>

      {/* Progress */}
      <div
        className="card"
        style={{ padding: "16px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 0 }}
      >
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: i > step ? 0.4 : 1,
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: i <= step ? "var(--gradient)" : "var(--surface-elevated)",
                color: i <= step ? "#fff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: i <= step ? "var(--text)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: i < step ? "var(--accent-subtle-md)" : "var(--border)", margin: "0 12px" }} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0: Company */}
        {step === 0 && (
          <Section title="Company Info">
            <Field label="Company Name *">
              <input
                type="text"
                required
                placeholder="e.g. Twiga Foods"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Contact Email *">
              <input
                type="email"
                required
                placeholder="hiring@yourcompany.com"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="input"
              />
            </Field>
            <button
              type="button"
              className="btn btn-primary"
              style={{ alignSelf: "flex-start" }}
              onClick={() => {
                if (form.companyName && form.contactEmail) setStep(1);
              }}
            >
              Next: Role Details
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </Section>
        )}

        {/* Step 1: Role */}
        {step === 1 && (
          <Section title="Role Details">
            <Field label="Role Needed *">
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer, Mobile Developer"
                value={form.roleNeeded}
                onChange={(e) => setForm({ ...form, roleNeeded: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Skills Required">
              {/* Selected skills */}
              {form.skillsRequired.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {form.skillsRequired.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 9,
                        background: "var(--accent-subtle)",
                        color: "var(--accent)",
                        fontSize: 13,
                        fontWeight: 500,
                        border: "1px solid var(--accent-subtle-md)",
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, skillsRequired: f.skillsRequired.filter((x) => x !== s) }))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", display: "flex", padding: 0 }}
                      >
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                  className="input"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-outline" onClick={() => addSkill(skillInput)}>Add</button>
              </div>
              {/* Suggestions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {skillSuggestions.filter((s) => !form.skillsRequired.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="skill-chip"
                    style={{ cursor: "pointer", border: "none" }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </Field>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { if (form.roleNeeded) setStep(2); }}
              >
                Next: Logistics
                <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </Section>
        )}

        {/* Step 2: Logistics */}
        {step === 2 && (
          <Section title="Logistics">
            <Field label="Budget Range *">
              <select
                required
                value={form.budgetRange}
                onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                className="input"
              >
                <option value="">Select a range</option>
                {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Timeline *">
              <select
                required
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                className="input"
              >
                <option value="">When do you need someone?</option>
                {timelines.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Work Style *">
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: true, label: "Remote OK" }, { val: false, label: "On-site / Hybrid" }].map(({ val, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setForm({ ...form, remote: val })}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: 11,
                      border: `1.5px solid ${form.remote === val ? "var(--accent)" : "var(--border)"}`,
                      background: form.remote === val ? "var(--accent-subtle)" : "transparent",
                      color: form.remote === val ? "var(--accent)" : "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 140ms ease",
                      fontFamily: "inherit",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            {!form.remote && (
              <Field label="Location">
                <input
                  type="text"
                  placeholder="e.g. Nairobi, Kenya"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input"
                />
              </Field>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary btn-primary-lg" style={{ flex: 1, justifyContent: "center" }}>
                Submit Request
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
              We respond within 2–3 business days with matched builder profiles.
            </p>
          </Section>
        )}
      </form>
    </div>
  );
}
