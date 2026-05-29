import { Code2, Rocket, Building2, CheckCircle2 } from "lucide-react";
import { type Role } from "@/hooks/useMyProfile";

export const roles: { id: Role; icon: React.ReactNode; title: string; subtitle: string; bullets: string[] }[] = [
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

export function RolePicker({
  selected,
  onSelect,
}: {
  selected: Role | null;
  onSelect: (role: Role) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
      {roles.map((role) => {
        const active = selected === role.id;
        return (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
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
  );
}
