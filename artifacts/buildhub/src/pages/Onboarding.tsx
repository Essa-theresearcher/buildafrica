import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowRight } from "lucide-react";
import { useMyProfile, type Role } from "@/hooks/useMyProfile";
import { RolePicker } from "@/components/RolePicker";

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

      <div style={{ marginBottom: 32 }}>
        <RolePicker selected={selected} onSelect={setSelected} />
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
