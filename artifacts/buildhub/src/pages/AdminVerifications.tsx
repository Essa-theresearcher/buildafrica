import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, Loader,
  AlertCircle, ChevronDown, X,
} from "lucide-react";
import { apiFetch } from "../lib/api";

type Application = {
  id: string;
  builder_clerk_id: string;
  status: string;
  primary_skill: string;
  challenge_title?: string;
  challenge_skill?: string;
  submission_github_url?: string;
  submission_demo_url?: string;
  submission_explanation?: string;
  submitted_at?: string;
  call_scheduled_at?: string;
  challenge_deadline?: string;
  admin_notes?: string;
  created_at: string;
};

type Challenge = {
  id: string;
  title: string;
  skill_category: string;
  requirements: string[];
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "challenge_assigned", label: "Challenge Assigned" },
  { value: "submitted", label: "Needs Call" },
  { value: "call_scheduled", label: "Call Scheduled" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending:            { bg: "var(--warning-bg)", color: "var(--warning)", border: "var(--warning-border)" },
  challenge_assigned: { bg: "var(--accent-subtle)", color: "var(--accent)", border: "var(--accent-subtle-md)" },
  submitted:          { bg: "var(--accent-subtle)", color: "var(--accent)", border: "var(--accent-subtle-md)" },
  call_scheduled:     { bg: "var(--accent-subtle)", color: "var(--accent)", border: "var(--accent-subtle-md)" },
  passed:             { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success-border)" },
  conditional_pass:   { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success-border)" },
  failed:             { bg: "var(--danger-bg)", color: "var(--danger)", border: "var(--danger-border)" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      textTransform: "capitalize",
    }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function AssignChallengeModal({
  app,
  onClose,
  onAssigned,
}: {
  app: Application;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/verify/challenges?skill=${app.primary_skill}`)
      .then((d) => setChallenges(d.challenges))
      .catch(() => setError("Failed to load challenges"));
  }, [app.primary_skill]);

  async function assign() {
    if (!selected) { setError("Select a challenge first"); return; }
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/verify/admin/assign-challenge", {
        method: "POST",
        body: JSON.stringify({ application_id: app.id, challenge_id: selected }),
      });
      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", margin: 0 }}>
            Assign Challenge
          </h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
          Skill: <strong style={{ color: "var(--text)", textTransform: "capitalize" }}>{app.primary_skill}</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {challenges.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              style={{
                padding: 16, borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: `2px solid ${selected === c.id ? "var(--accent)" : "var(--border)"}`,
                background: selected === c.id ? "var(--accent-subtle)" : "var(--surface-elevated)",
                transition: "all 140ms",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{c.title}</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {(c.requirements as any as string[]).slice(0, 3).map((r, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-muted)" }}>{r}</li>
                ))}
                {(c.requirements as any as string[]).length > 3 && (
                  <li style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    +{(c.requirements as any as string[]).length - 3} more requirements
                  </li>
                )}
              </ul>
            </button>
          ))}
          {challenges.length === 0 && !error && (
            <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
              No challenges found for this skill category.
            </p>
          )}
        </div>

        {error && (
          <div style={{
            borderRadius: 10, padding: "10px 14px", marginBottom: 14,
            background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
            color: "var(--danger)", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={loading || !selected}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "12px", borderRadius: 11, opacity: !selected ? 0.5 : 1 }}
          onClick={assign}
        >
          {loading ? <Loader style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> : "Assign This Challenge"}
        </button>
      </div>
    </div>
  );
}

function DecideModal({
  app,
  onClose,
  onDecided,
}: {
  app: Application;
  onClose: () => void;
  onDecided: () => void;
}) {
  const [decision, setDecision] = useState<"passed" | "failed" | "conditional_pass">("passed");
  const [notes, setNotes] = useState("");
  const [badgeScope, setBadgeScope] = useState("");
  const [checklist, setChecklist] = useState({
    can_demo_without_hesitation: false,
    can_explain_approach: false,
    answered_unexpected_questions: false,
    made_live_change: false,
    commit_history_real: false,
    has_other_projects: false,
    knows_community: false,
    gut_feeling_pass: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkCount = Object.values(checklist).filter(Boolean).length;

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/verify/admin/decide", {
        method: "POST",
        body: JSON.stringify({
          application_id: app.id,
          decision,
          admin_notes: notes,
          badge_scope: badgeScope || undefined,
          checklist,
        }),
      });
      onDecided();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const checklistItems: { key: keyof typeof checklist; label: string }[] = [
    { key: "can_demo_without_hesitation", label: "Can demo without hesitation" },
    { key: "can_explain_approach", label: "Can explain their approach" },
    { key: "answered_unexpected_questions", label: "Answered unexpected questions" },
    { key: "made_live_change", label: "Made a live change on call" },
    { key: "commit_history_real", label: "Commit history looks real" },
    { key: "has_other_projects", label: "Has other shipped projects" },
    { key: "knows_community", label: "Knows the Coffee & Code community" },
    { key: "gut_feeling_pass", label: "Gut feeling: pass" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: "100%", maxWidth: 540, maxHeight: "85vh", overflowY: "auto", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", margin: 0 }}>Record Decision</h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Call checklist */}
        <div className="card" style={{ padding: 18, marginBottom: 20, background: "var(--surface-elevated)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", margin: 0 }}>Call Checklist</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: checkCount >= 6 ? "var(--success)" : "var(--text-muted)" }}>
              {checkCount}/8
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checklistItems.map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checklist[key]}
                  onChange={(e) => setChecklist((c) => ({ ...c, [key]: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: checklist[key] ? "var(--text)" : "var(--text-muted)" }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Decision */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
            Decision
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["passed", "conditional_pass", "failed"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDecision(d)}
                style={{
                  flex: 1, padding: "9px 10px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${decision === d ? (d === "failed" ? "var(--danger)" : d === "conditional_pass" ? "var(--warning)" : "var(--success)") : "var(--border)"}`,
                  background: decision === d ? (d === "failed" ? "var(--danger-bg)" : d === "conditional_pass" ? "var(--warning-bg)" : "var(--success-bg)") : "var(--surface)",
                  color: decision === d ? (d === "failed" ? "var(--danger)" : d === "conditional_pass" ? "var(--warning)" : "var(--success)") : "var(--text-muted)",
                }}
              >
                {d === "passed" ? "Pass" : d === "conditional_pass" ? "Conditional" : "Fail"}
              </button>
            ))}
          </div>
        </div>

        {(decision === "passed" || decision === "conditional_pass") && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              Badge Scope (optional)
            </label>
            <input
              type="text"
              value={badgeScope}
              onChange={(e) => setBadgeScope(e.target.value)}
              placeholder="e.g. frontend only, React specialist"
              style={{
                width: "100%", boxSizing: "border-box", padding: "9px 13px", borderRadius: 9,
                border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none",
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
            Admin Notes (shown to builder)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Feedback for the builder..."
            style={{
              width: "100%", boxSizing: "border-box", padding: "9px 13px", borderRadius: 9,
              border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13,
              outline: "none", resize: "vertical", lineHeight: 1.6,
            }}
          />
        </div>

        {error && (
          <div style={{ borderRadius: 9, padding: "10px 13px", marginBottom: 14, background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: "100%", justifyContent: "center", padding: "12px", borderRadius: 11,
            background: decision === "failed" ? "var(--danger)" : undefined,
          }}
          onClick={submit}
        >
          {loading ? <Loader style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> : `Record: ${decision === "passed" ? "Pass" : decision === "conditional_pass" ? "Conditional Pass" : "Fail"}`}
        </button>
      </div>
    </div>
  );
}

export default function AdminVerifications() {
  const { user, isLoaded } = useUser();
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignModal, setAssignModal] = useState<Application | null>(null);
  const [decideModal, setDecideModal] = useState<Application | null>(null);

  const adminIds = (import.meta.env.VITE_ADMIN_CLERK_IDS || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const isAdmin = user && adminIds.includes(user.id);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/verify/admin/all?status=${filter}`);
      setApps(data.applications);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (isLoaded && isAdmin) load(); }, [isLoaded, filter, isAdmin]);

  if (!isLoaded) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <Loader style={{ width: 22, height: 22, color: "var(--accent)", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!user) return (
    <div className="card" style={{ maxWidth: 480, margin: "80px auto", padding: 40, textAlign: "center" }}>
      <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 16px" }}>Admin access required</h2>
      <a href="/sign-in" className="btn btn-primary">Sign In</a>
    </div>
  );

  if (!isAdmin) return (
    <div className="card" style={{ maxWidth: 480, margin: "80px auto", padding: 40, textAlign: "center" }}>
      <AlertCircle style={{ width: 28, height: 28, color: "var(--danger)", margin: "0 auto 12px" }} />
      <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 10px" }}>Access denied</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>You don't have admin access to BuildHub.</p>
      <Link href="/" className="btn btn-outline" style={{ display: "inline-flex", marginTop: 20 }}>Go Home</Link>
    </div>
  );

  return (
    <div>
      {/* Modals */}
      {assignModal && (
        <AssignChallengeModal app={assignModal} onClose={() => setAssignModal(null)} onAssigned={load} />
      )}
      {decideModal && (
        <DecideModal app={decideModal} onClose={() => setDecideModal(null)} onDecided={load} />
      )}

      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>
          Verification Applications
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${filter === f.value ? "var(--accent)" : "var(--border)"}`,
              background: filter === f.value ? "var(--accent-subtle)" : "var(--surface)",
              color: filter === f.value ? "var(--accent)" : "var(--text-muted)",
              transition: "all 140ms",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader style={{ width: 22, height: 22, color: "var(--accent)", animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {error && (
        <div style={{ borderRadius: 10, padding: "12px 16px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: 14 }}>
          {error}
        </div>
      )}

      {!loading && apps.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <CheckCircle2 style={{ width: 28, height: 28, color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No applications in this category.</p>
        </div>
      )}

      {!loading && apps.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {apps.map((app) => (
            <div key={app.id} className="card" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 14 }}>
                {/* Left info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <StatusBadge status={app.status} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {app.primary_skill}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {app.builder_clerk_id.slice(0, 20)}…
                  </div>
                  {app.challenge_title && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                      Challenge: <span style={{ color: "var(--text)" }}>{app.challenge_title}</span>
                    </div>
                  )}
                  {app.challenge_deadline && app.status === "challenge_assigned" && (
                    <div style={{ marginTop: 8 }}>
                      <Clock style={{ width: 11, height: 11, display: "inline", marginRight: 4, color: "var(--warning)" }} />
                      <span style={{ fontSize: 11, color: "var(--warning)" }}>
                        Deadline: {new Date(app.challenge_deadline).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                  {app.submission_github_url && (
                    <div style={{ marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <a href={app.submission_github_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>GitHub →</a>
                      {app.submission_demo_url && <a href={app.submission_demo_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>Demo →</a>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  {app.status === "pending" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13 }}
                      onClick={() => setAssignModal(app)}
                    >
                      Assign Challenge
                    </button>
                  )}
                  {app.status === "submitted" && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13 }}
                      onClick={async () => {
                        const callTime = prompt("Enter call date/time (ISO format, e.g. 2024-12-01T14:00:00):");
                        if (!callTime) return;
                        try {
                          await apiFetch("/api/verify/admin/schedule-call", {
                            method: "POST",
                            body: JSON.stringify({ application_id: app.id, call_scheduled_at: callTime }),
                          });
                          load();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                    >
                      Schedule Call
                    </button>
                  )}
                  {app.status === "call_scheduled" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13 }}
                      onClick={() => setDecideModal(app)}
                    >
                      Record Decision
                    </button>
                  )}
                </div>
              </div>

              {app.submission_explanation && (
                <details style={{ marginTop: 14 }}>
                  <summary style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>
                    View explanation
                  </summary>
                  <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, marginTop: 8, paddingLeft: 0 }}>
                    {app.submission_explanation}
                  </p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
