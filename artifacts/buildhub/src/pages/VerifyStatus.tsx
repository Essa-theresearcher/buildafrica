import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Loader, ExternalLink, Upload, ChevronRight,
} from "lucide-react";
import { apiFetch } from "../lib/api";

type Application = {
  id: string;
  status: string;
  primary_skill: string;
  challenge_title?: string;
  challenge_description?: string;
  challenge_requirements?: string[];
  challenge_local_context?: string;
  challenge_time_limit_hours?: number;
  challenge_deadline?: string;
  submission_github_url?: string;
  submission_demo_url?: string;
  submission_explanation?: string;
  submitted_at?: string;
  call_scheduled_at?: string;
  admin_notes?: string;
  created_at: string;
};

const STEPS = [
  { key: "pending", label: "Applied" },
  { key: "challenge_assigned", label: "Challenge Assigned" },
  { key: "submitted", label: "Submitted" },
  { key: "call_scheduled", label: "Call Scheduled" },
  { key: "passed", label: "Decision Made" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  challenge_assigned: 1,
  submitted: 2,
  call_scheduled: 3,
  passed: 4,
  failed: 4,
  conditional_pass: 4,
};

function Countdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Deadline passed"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s remaining`);
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  const isPast = new Date(deadline).getTime() < Date.now();
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "7px 14px", borderRadius: 9,
      background: isPast ? "var(--danger-bg)" : "var(--warning-bg)",
      border: `1px solid ${isPast ? "var(--danger-border)" : "var(--warning-border)"}`,
      color: isPast ? "var(--danger)" : "var(--warning)",
      fontSize: 13, fontWeight: 700,
    }}>
      <Clock style={{ width: 13, height: 13 }} />
      {remaining}
    </div>
  );
}

function SubmissionForm({ applicationId, onSubmitted }: { applicationId: string; onSubmitted: () => void }) {
  const [form, setForm] = useState({ github_url: "", demo_url: "", explanation: "" });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.github_url.startsWith("https://github.com/")) e.github_url = "Must start with https://github.com/";
    if (!form.demo_url.startsWith("https://")) e.demo_url = "Must start with https://";
    if (form.explanation.length < 150) e.explanation = `Too short — ${form.explanation.length}/150 characters minimum`;
    if (form.explanation.length > 500) e.explanation = `Too long — ${form.explanation.length}/500 characters maximum`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    try {
      let screenshot_url = "";
      if (screenshotFile) {
        // Upload screenshot to API server (store in object storage or as data URL fallback)
        const fd = new FormData();
        fd.append("file", screenshotFile);
        const uploadRes = await fetch(`${import.meta.env.DEV ? "http://localhost:5000" : ""}/api/verify/upload-screenshot`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          screenshot_url = uploadData.url || "";
        }
      }
      await apiFetch("/api/verify/submit", {
        method: "POST",
        body: JSON.stringify({ ...form, screenshot_url }),
      });
      onSubmitted();
    } catch (err: any) {
      setErrors({ _: err.message });
    } finally {
      setUploading(false);
    }
  }

  const charCount = form.explanation.length;
  const charColor = charCount < 150 ? "var(--danger)" : charCount > 500 ? "var(--danger)" : "var(--success)";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          GitHub Repository URL *
        </label>
        <input
          type="url"
          value={form.github_url}
          onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
          placeholder="https://github.com/yourname/project"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px", borderRadius: 10,
            border: `1.5px solid ${errors.github_url ? "var(--danger)" : "var(--border)"}`,
            background: "var(--surface)", color: "var(--text)", fontSize: 14,
            outline: "none",
          }}
        />
        {errors.github_url && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.github_url}</p>}
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          Live Demo URL *
        </label>
        <input
          type="url"
          value={form.demo_url}
          onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
          placeholder="https://your-demo.vercel.app"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px", borderRadius: 10,
            border: `1.5px solid ${errors.demo_url ? "var(--danger)" : "var(--border)"}`,
            background: "var(--surface)", color: "var(--text)", fontSize: 14,
            outline: "none",
          }}
        />
        {errors.demo_url && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.demo_url}</p>}
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          What did you build, what was the hardest problem you solved, and what would you change with more time? *
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          rows={6}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px", borderRadius: 10,
            border: `1.5px solid ${errors.explanation ? "var(--danger)" : "var(--border)"}`,
            background: "var(--surface)", color: "var(--text)", fontSize: 14,
            outline: "none", resize: "vertical", lineHeight: 1.6,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {errors.explanation
            ? <p style={{ fontSize: 12, color: "var(--danger)" }}>{errors.explanation}</p>
            : <span />}
          <span style={{ fontSize: 12, color: charColor, fontWeight: 600 }}>{charCount}/500</span>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          Screenshot (optional)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: 10,
            border: "1.5px dashed var(--border)",
            background: "var(--surface-elevated)",
            color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
          }}
        >
          <Upload style={{ width: 14, height: 14 }} />
          {screenshotFile ? screenshotFile.name : "Choose image"}
        </button>
      </div>

      {errors._ && (
        <div style={{
          borderRadius: 10, padding: "10px 14px",
          background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
          color: "var(--danger)", fontSize: 13,
        }}>
          {errors._}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="btn btn-primary"
        style={{ justifyContent: "center", padding: "13px", borderRadius: 12 }}
      >
        {uploading
          ? <Loader style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
          : "Submit My Work"}
      </button>
    </form>
  );
}

export default function VerifyStatus() {
  const { user, isLoaded } = useUser();
  const [app, setApp] = useState<Application | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setFetching(true);
    try {
      const data = await apiFetch("/api/verify/status");
      setApp(data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => { if (isLoaded && user) load(); }, [isLoaded, user]);

  if (!isLoaded || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Loader style={{ width: 22, height: 22, color: "var(--accent)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "80px auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 16px" }}>Sign in to view your status</h2>
        <a href="/sign-in" className="btn btn-primary">Sign In</a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "80px auto", padding: 40, textAlign: "center" }}>
        <AlertCircle style={{ width: 28, height: 28, color: "var(--danger)", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "80px auto", padding: 40, textAlign: "center" }}>
        <ShieldCheck style={{ width: 36, height: 36, color: "var(--accent)", margin: "0 auto 16px" }} />
        <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 10px" }}>No active application</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          You haven't started the verification process yet.
        </p>
        <Link href="/verify" className="btn btn-primary" style={{ display: "inline-flex" }}>
          Apply for Verification
          <ChevronRight style={{ width: 15, height: 15 }} />
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[app.status] ?? 0;
  const isFinal = ["passed", "failed", "conditional_pass"].includes(app.status);
  const deadlinePassed = app.challenge_deadline ? new Date(app.challenge_deadline).getTime() < Date.now() : false;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 10 }}>Verification Status</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
          Your Application
        </h1>
      </div>

      {/* Step tracker */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
          {STEPS.map((step, i) => {
            const done = i < currentStep || (isFinal && i === currentStep);
            const active = i === currentStep && !isFinal;
            const failed = app.status === "failed" && i === currentStep;
            return (
              <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 80 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: failed ? "var(--danger)" : done ? "var(--success)" : active ? "var(--accent)" : "var(--surface-elevated)",
                    border: `2px solid ${failed ? "var(--danger)" : done ? "var(--success)" : active ? "var(--accent)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 200ms",
                  }}>
                    {done && !failed
                      ? <CheckCircle2 style={{ width: 16, height: 16, color: "#fff" }} />
                      : failed
                      ? <XCircle style={{ width: 16, height: 16, color: "#fff" }} />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "var(--text-muted)" }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: active || done ? "var(--text)" : "var(--text-muted)", textAlign: "center", whiteSpace: "nowrap" }}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: "-18px 6px 0",
                    background: i < currentStep ? "var(--success)" : "var(--border)",
                    transition: "background 200ms",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status-specific content */}

      {/* PENDING */}
      {app.status === "pending" && (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <Clock style={{ width: 28, height: 28, color: "var(--warning)", margin: "0 auto 12px" }} />
          <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", margin: "0 0 8px" }}>Application received</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65 }}>
            A BuildHub admin will review your application and assign you a coding challenge.
            This usually takes 1–2 business days.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12 }}>
            Skill: <strong style={{ color: "var(--text)", textTransform: "capitalize" }}>{app.primary_skill}</strong>
          </p>
        </div>
      )}

      {/* CHALLENGE ASSIGNED */}
      {app.status === "challenge_assigned" && app.challenge_title && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: 6 }}>Your Challenge</div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: 0 }}>{app.challenge_title}</h2>
              </div>
              {app.challenge_deadline && <Countdown deadline={app.challenge_deadline} />}
            </div>
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 18,
              background: "var(--accent-subtle)", border: "1px solid var(--accent-subtle-md)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Context</p>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65, margin: 0 }}>{app.challenge_local_context}</p>
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 10px" }}>Requirements</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {(app.challenge_requirements as any as string[]).map((req, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>
                  <span style={{
                    flexShrink: 0, width: 20, height: 20, borderRadius: "50%", marginTop: 1,
                    background: "var(--success-bg)", color: "var(--success)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                  }}>{i + 1}</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {!deadlinePassed && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: "var(--text)", margin: "0 0 20px" }}>Submit Your Work</h3>
              <SubmissionForm applicationId={app.id} onSubmitted={load} />
            </div>
          )}

          {deadlinePassed && (
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <XCircle style={{ width: 26, height: 26, color: "var(--danger)", margin: "0 auto 10px" }} />
              <p style={{ color: "var(--danger)", fontWeight: 600, fontSize: 14 }}>The submission deadline has passed.</p>
            </div>
          )}
        </div>
      )}

      {/* SUBMITTED */}
      {app.status === "submitted" && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <CheckCircle2 style={{ width: 24, height: 24, color: "var(--success)" }} />
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>Work submitted</h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
            Waiting for a BuildHub admin to review your submission and schedule a live call.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {app.submission_github_url && (
              <a href={app.submission_github_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                <ExternalLink style={{ width: 13, height: 13 }} /> {app.submission_github_url}
              </a>
            )}
            {app.submission_demo_url && (
              <a href={app.submission_demo_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                <ExternalLink style={{ width: 13, height: 13 }} /> {app.submission_demo_url}
              </a>
            )}
          </div>
        </div>
      )}

      {/* CALL SCHEDULED */}
      {app.status === "call_scheduled" && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Clock style={{ width: 24, height: 24, color: "var(--accent)" }} />
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>Call confirmed</h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 14 }}>
            Your call is confirmed. Be ready to demo your project live — share your screen, run it, make a live change if asked.
          </p>
          {app.call_scheduled_at && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 16px", borderRadius: 10,
              background: "var(--accent-subtle)", border: "1px solid var(--accent-subtle-md)",
              color: "var(--accent)", fontSize: 14, fontWeight: 600,
            }}>
              <Clock style={{ width: 15, height: 15 }} />
              {new Date(app.call_scheduled_at).toLocaleString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          )}
        </div>
      )}

      {/* PASSED */}
      {app.status === "passed" && (
        <div className="card" style={{ padding: 36, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gradient)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <ShieldCheck style={{ width: 30, height: 30, color: "#fff" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 24, color: "var(--text)", margin: "0 0 10px" }}>
            You're a Verified Builder
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65, maxWidth: 440, margin: "0 auto 24px" }}>
            The badge has been added to your profile. Companies can now see that your skills have been reviewed and confirmed by a BuildHub admin.
          </p>
          {app.admin_notes && (
            <div style={{
              borderRadius: 12, padding: "14px 18px", marginBottom: 24,
              background: "var(--success-bg)", border: "1px solid var(--success-border)",
              color: "var(--success)", fontSize: 14, textAlign: "left",
            }}>
              <strong>Admin feedback:</strong> {app.admin_notes}
            </div>
          )}
          <Link href="/builders" className="btn btn-primary" style={{ display: "inline-flex" }}>
            View Builder Directory
          </Link>
        </div>
      )}

      {/* CONDITIONAL PASS */}
      {app.status === "conditional_pass" && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck style={{ width: 20, height: 20, color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", margin: 0 }}>Verified — with scope</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Conditional verification</p>
            </div>
          </div>
          {app.admin_notes && (
            <div style={{
              borderRadius: 10, padding: "14px 16px",
              background: "var(--accent-subtle)", border: "1px solid var(--accent-subtle-md)",
              color: "var(--text)", fontSize: 14, lineHeight: 1.65,
            }}>
              {app.admin_notes}
            </div>
          )}
        </div>
      )}

      {/* FAILED */}
      {app.status === "failed" && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <XCircle style={{ width: 28, height: 28, color: "var(--danger)" }} />
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>Not verified this time</h2>
          </div>
          {app.admin_notes && (
            <div style={{
              borderRadius: 10, padding: "14px 16px", marginBottom: 16,
              background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
              color: "var(--text)", fontSize: 14, lineHeight: 1.65,
            }}>
              <strong>Admin feedback:</strong> {app.admin_notes}
            </div>
          )}
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            You can reapply in 60 days. Use the time to ship another project and come back stronger.
          </p>
        </div>
      )}
    </div>
  );
}
