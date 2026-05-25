import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck, Clock, XCircle, CheckCircle2, ChevronRight,
  Layers, ArrowUpRight, Briefcase, Zap, Star, PlusCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { builders, projects, companyRequests } from "@/data/seed";
import { useRequireRole } from "@/hooks/useRequireRole";

function PortalLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--accent)",
          borderTopColor: "transparent", margin: "0 auto 16px",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your portal…</p>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function VerificationCard({ status }: { status: string | null }) {
  if (!status || status === "none") {
    return (
      <div className="card" style={{ padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShieldCheck style={{ width: 22, height: 22, color: "var(--text-muted)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>Not Verified Yet</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
            Complete the verification challenge to earn your Verified Builder badge and stand out to companies.
          </div>
          <Link href="/verify" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 18px" }}>
            Apply for Verification
          </Link>
        </div>
      </div>
    );
  }

  const configs: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; desc: string }> = {
    pending: {
      icon: <Clock style={{ width: 20, height: 20 }} />,
      label: "Application Pending",
      color: "var(--warning)",
      bg: "var(--warning-bg)",
      desc: "Your application is under review. Admin will assign a challenge shortly.",
    },
    challenge_assigned: {
      icon: <Layers style={{ width: 20, height: 20 }} />,
      label: "Challenge Assigned",
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      desc: "You have an active challenge to complete. Submit your work before the deadline.",
    },
    submitted: {
      icon: <CheckCircle2 style={{ width: 20, height: 20 }} />,
      label: "Work Submitted",
      color: "var(--success)",
      bg: "var(--success-bg)",
      desc: "Your submission is in review. Admin will schedule a call with you.",
    },
    call_scheduled: {
      icon: <Clock style={{ width: 20, height: 20 }} />,
      label: "Review Call Scheduled",
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      desc: "Your review call is booked. Check your email for details.",
    },
    passed: {
      icon: <ShieldCheck style={{ width: 20, height: 20 }} />,
      label: "Verified Builder ✓",
      color: "var(--success)",
      bg: "var(--success-bg)",
      desc: "You've earned the Verified Builder badge. It's shown on your profile.",
    },
    failed: {
      icon: <XCircle style={{ width: 20, height: 20 }} />,
      label: "Verification Not Passed",
      color: "var(--error, #e11d48)",
      bg: "rgba(225,29,72,0.08)",
      desc: "You can re-apply after 30 days.",
    },
  };

  const cfg = configs[status] || configs.pending;

  return (
    <div className="card" style={{ padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, flexShrink: 0 }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: cfg.color, marginBottom: 4 }}>{cfg.label}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{cfg.desc}</div>
        {(status === "challenge_assigned" || status === "submitted") && (
          <Link href="/verify/status" className="btn btn-primary" style={{ marginTop: 14, fontSize: 13, padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            View Challenge <ArrowUpRight style={{ width: 13, height: 13 }} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function BuilderPortal() {
  const { ready } = useRequireRole("builder");
  const { user } = useUser();
  const firstName = user?.firstName || "Builder";

  const { data: verifyData } = useQuery({
    queryKey: ["verify-status"],
    queryFn: () => apiFetch("/api/verify/status"),
    staleTime: 60_000,
    enabled: ready,
  });

  if (!ready) return <PortalLoader />;

  const verificationStatus = verifyData?.application?.status ?? null;

  const myProjects = projects.slice(0, 3);
  const requests = companyRequests.slice(0, 3);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>Builder Portal</div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "6px 0 0" }}>
            Your builder workspace — profile, verification, projects, and incoming requests.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/verify" className="btn btn-ghost" style={{ fontSize: 13, padding: "9px 18px" }}>
            Apply for Verification
          </Link>
          <Link href="/projects" className="btn btn-primary" style={{ fontSize: 13, padding: "9px 18px", display: "flex", alignItems: "center", gap: 6 }}>
            <PlusCircle style={{ width: 14, height: 14 }} /> Add Project
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Projects Shipped", value: myProjects.length, icon: <Layers style={{ width: 16, height: 16 }} /> },
          { label: "Company Requests", value: requests.length, icon: <Briefcase style={{ width: 16, height: 16 }} /> },
          { label: "Verification", value: verificationStatus === "passed" ? "Verified ✓" : "Pending", icon: <ShieldCheck style={{ width: 16, height: 16 }} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "var(--accent)" }}>{icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Verification */}
          <section>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
              Verification Status
            </h2>
            <VerificationCard status={verificationStatus} />
          </section>

          {/* Profile quick view */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                Your Profile
              </h2>
              <Link href={`/builders/${builders[0]?.username || ""}`} style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                View public profile <ChevronRight style={{ width: 13, height: 13 }} />
              </Link>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div className="avatar avatar-lg gradient-bg" style={{ color: "#fff", fontWeight: 800 }}>
                  {getInitials(user?.fullName || firstName)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{user?.fullName || firstName}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Full-Stack Builder · Nairobi</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Shipped Project", "Available for Work"].map((tag) => (
                  <span key={tag} className="badge" style={{ fontSize: 11 }}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Company requests */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                Company Requests
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{requests.length} open</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {requests.map((req) => (
                <div key={req.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{req.companyName}</div>
                    <span className="badge" style={{ background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)", fontSize: 10, flexShrink: 0 }}>
                      {req.budgetRange}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 8 }}>{req.roleNeeded}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(req.skillsRequired || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="badge" style={{ fontSize: 10 }}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* My projects */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                Your Projects
              </h2>
              <Link href="/projects" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                View all <ChevronRight style={{ width: 13, height: 13 }} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myProjects.map((proj) => (
                <div key={proj.id} className="card" style={{ padding: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Star style={{ width: 16, height: 16, color: "var(--accent)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {proj.description}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      fontSize: 10, flexShrink: 0,
                      ...(proj.status === "Shipped"
                        ? { background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }
                        : { background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }),
                    }}
                  >
                    <Zap style={{ width: 8, height: 8 }} /> {proj.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
