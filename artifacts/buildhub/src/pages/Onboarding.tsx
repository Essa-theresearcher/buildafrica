import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { Code2, Rocket, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMyProfile, type Role } from "@/hooks/useMyProfile";

const roles: { id: Role; icon: React.ReactNode; title: string; subtitle: string; bullets: string[] }[] = [
  {
    id: "builder",
    icon: <Code2 style={{ width: 28, height: 28 }} />,
    title: "I'm a Builder",
    subtitle: "I ship software and want to prove my execution track record.",
    bullets: [
      "Get a verified builder profile",
      "Showcase your projects & contributions",
      "Receive company hire requests",
      "Apply for the Verified Builder badge",
    ],
  },
  {
    id: "startup",
    icon: <Rocket style={{ width: 28, height: 28 }} />,
    title: "I'm a Startup Founder",
    subtitle: "I'm building a product and want visibility in the East African tech scene.",
    bullets: [
      "List your startup in the directory",
      "Post updates as you ship",
      "Get upvotes from the community",
      "Access paid marketing packages",
    ],
  },
  {
    id: "company",
    icon: <Building2 style={{ width: 28, height: 28 }} />,
    title: "I'm Hiring",
    subtitle: "I need to find reliable builders from a trusted community.",
    bullets: [
      "Browse verified builder profiles",
      "Filter by skill, availability & location",
      "Post a hire request",
      "Get hand-picked matches from the team",
    ],
  },
];

export default function Onboarding() {
  const { user } = useUser();
  const { setRole } = useMyProfile();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const firstName = user?.firstName || "there";

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    try {
      await setRole.mutateAsync(selected);
      if (selected === "builder") setLocation("/portal/builder");
      else if (selected === "startup") setLocation("/portal/startup");
      else setLocation("/portal/company");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div className="section-eyebrow" style={{ marginBottom: 12 }}>Welcome to BuildHub</div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 12px" }}>
          Hey {firstName}, what brings you here?
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", margin: 0 }}>
          Choose your role — we'll set up your personal portal.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {roles.map((role) => {
          const active = selected === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: 24,
                borderRadius: 16,
                border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent-bg)" : "var(--surface)",
                transition: "border-color 0.15s, background 0.15s",
                position: "relative",
                textAlign: "left",
              }}
            >
              {active && (
                <CheckCircle2
                  style={{
                    position: "absolute", top: 16, right: 16,
                    width: 20, height: 20, color: "var(--accent)",
                  }}
                />
              )}
              <div
                className={active ? "gradient-bg" : ""}
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? undefined : "var(--surface-elevated)",
                  color: active ? "#fff" : "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                {role.icon}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                  {role.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
                  {role.subtitle}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {role.bullets.map((b) => (
                    <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                        background: active ? "var(--accent)" : "var(--text-muted)",
                      }} />
                      <span style={{ fontSize: 12, color: active ? "var(--text)" : "var(--text-muted)", lineHeight: 1.5 }}>
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!selected || saving}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, padding: "14px 32px", opacity: selected ? 1 : 0.4 }}
        >
          {saving ? "Setting up your portal…" : "Continue to my portal"}
          {!saving && <ArrowRight style={{ width: 16, height: 16 }} />}
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
        You can always change this later from your settings.
      </p>
    </div>
  );
}
