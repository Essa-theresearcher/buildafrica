import { useState } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { ShieldCheck, AlertCircle, ArrowRight, Loader } from "lucide-react";
import { apiFetch } from "../lib/api";

const SKILLS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "data", label: "Data" },
  { value: "devops", label: "DevOps" },
];

const STEPS = [
  { n: "01", label: "You apply and choose your primary skill" },
  { n: "02", label: "Admin assigns a 72-hour coding challenge" },
  { n: "03", label: "You submit your work with a live demo link" },
  { n: "04", label: "Admin reviews and conducts a live video call" },
];

export default function VerifyApply() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Loader style={{ width: 22, height: 22, color: "var(--accent)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "80px auto", padding: 40, textAlign: "center" }}>
        <AlertCircle style={{ width: 32, height: 32, color: "var(--warning)", margin: "0 auto 16px" }} />
        <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 10px" }}>Sign in to apply</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          You need to be signed in to apply for verification.
        </p>
        <a href="/sign-in" className="btn btn-primary">Sign In</a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!skill) { setError("Please select your primary skill."); return; }
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/verify/apply", {
        method: "POST",
        body: JSON.stringify({ primary_skill: skill }),
      });
      setLocation("/verify/status");
    } catch (err: any) {
      if (err.message.includes("active application")) {
        setLocation("/verify/status");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-eyebrow" style={{ marginBottom: 12 }}>Builder Verification</div>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 12px" }}>
          Apply for Builder Verification
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Verification means a BuildHub admin has reviewed your work and confirmed you can ship real software.
          The badge is earned — not self-assigned. Here's how it works:
        </p>
      </div>

      {/* Process steps */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "var(--accent-subtle)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800,
              }}>
                {s.n}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0, paddingTop: 6 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Application form */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--gradient)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck style={{ width: 18, height: 18, color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
              {user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {user.emailAddresses?.[0]?.emailAddress}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              What is your primary skill?
            </label>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              Choose the skill you want to be verified in. You'll receive a challenge specific to this area.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {SKILLS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSkill(s.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${skill === s.value ? "var(--accent)" : "var(--border)"}`,
                    background: skill === s.value ? "var(--accent-subtle)" : "var(--surface)",
                    color: skill === s.value ? "var(--accent)" : "var(--text)",
                    fontSize: 13, fontWeight: skill === s.value ? 700 : 500,
                    cursor: "pointer", transition: "all 140ms",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {skill === s.value && <ShieldCheck style={{ width: 13, height: 13 }} />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
              color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !skill}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px", borderRadius: 12, opacity: !skill ? 0.5 : 1 }}
          >
            {loading ? (
              <Loader style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            ) : (
              <>
                Start Verification
                <ArrowRight style={{ width: 15, height: 15 }} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
