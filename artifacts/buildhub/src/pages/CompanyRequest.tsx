import { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

const budgetOptions = [
  "Under $1,000/month",
  "$1,000–$2,500/month",
  "$2,500–$5,000/month",
  "$5,000–$10,000/month",
  "$10,000+/month",
  "Project-based (fixed fee)",
];

const timelineOptions = [
  "Immediately",
  "Within 2 weeks",
  "Within 1 month",
  "1–3 months",
  "Flexible",
];

const skillSuggestions = [
  "React", "Node.js", "Python", "TypeScript", "PostgreSQL", "React Native",
  "Django", "FastAPI", "Figma", "AWS", "Docker", "M-Pesa Integration",
  "Firebase", "Supabase", "Next.js", "Flutter", "GraphQL",
];

export default function CompanyRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    roleNeeded: "",
    skillsRequired: [] as string[],
    budgetRange: "",
    remote: true,
    location: "",
    timeline: "",
    contactEmail: "",
  });

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !form.skillsRequired.includes(s)) {
      setForm((f) => ({ ...f, skillsRequired: [...f.skillsRequired, s] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skillsRequired: f.skillsRequired.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success)]/10">
            <CheckCircle className="h-10 w-10 text-[var(--success)]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Request Submitted</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Thank you, <strong className="text-[var(--text)]">{form.companyName}</strong>. We've received your request and will match you with verified builders within 2–3 business days.
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          We'll reach out to <strong className="text-[var(--text)]">{form.contactEmail}</strong> with matched profiles.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-outline mx-auto mt-8 inline-flex"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Hire a Builder</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Tell us what you need. We'll match you with the right verified builder from our community — people who've actually shipped the kind of product you're building.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Company Info</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Twiga Foods"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Contact Email *</label>
              <input
                type="email"
                required
                placeholder="hiring@yourcompany.com"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Role Details */}
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Role Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Role Needed *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer, Mobile Developer"
                value={form.roleNeeded}
                onChange={(e) => setForm({ ...form, roleNeeded: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Skills Required</label>
              <div className="mb-2 flex flex-wrap gap-2">
                {form.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-3 py-1 text-sm text-[var(--accent)]"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-[var(--accent)] opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="btn-outline flex-shrink-0 px-4"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skillSuggestions
                  .filter((s) => !form.skillsRequired.includes(s))
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="rounded-md border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logistics */}
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Logistics</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Budget Range *</label>
              <select
                required
                value={form.budgetRange}
                onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                className="input"
              >
                <option value="">Select a budget range</option>
                {budgetOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Timeline *</label>
              <select
                required
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                className="input"
              >
                <option value="">When do you need someone?</option>
                {timelineOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Work Style *</label>
              <div className="flex gap-3">
                {[
                  { val: true, label: "Remote OK" },
                  { val: false, label: "On-site / Hybrid" },
                ].map(({ val, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setForm({ ...form, remote: val })}
                    className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                      form.remote === val
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {!form.remote && (
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi, Kenya"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input"
                />
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3">
          Submit Request
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-xs text-[var(--text-muted)]">
          We typically respond within 2–3 business days with matched builder profiles.
        </p>
      </form>
    </div>
  );
}
