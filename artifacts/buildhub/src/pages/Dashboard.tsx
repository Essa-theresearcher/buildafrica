import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useMyProfile, type Role, readPendingRole, clearPendingRole } from "@/hooks/useMyProfile";

function portalPath(role: Role): string {
  if (role === "builder") return "/portal/builder";
  if (role === "startup") return "/portal/startup";
  return "/portal/company";
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const { profile, isLoading, setRole } = useMyProfile();
  const [, setLocation] = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    if (!isLoaded || isLoading || handled.current) return;

    if (!isSignedIn) {
      handled.current = true;
      setLocation("/sign-in");
      return;
    }

    if (profile) {
      // Existing account — a stale sign-up role must never override it.
      clearPendingRole();
      handled.current = true;
      setLocation(portalPath(profile.role));
      return;
    }

    // No saved profile yet. If the user picked a role during sign-up (fresh,
    // unexpired), save it now and route them straight to their portal.
    const pending = readPendingRole();
    if (pending) {
      handled.current = true;
      setRole
        .mutateAsync(pending)
        .then(() => {
          clearPendingRole();
          setLocation(portalPath(pending));
        })
        .catch(() => {
          // Saving failed — let them pick manually rather than getting stuck.
          clearPendingRole();
          handled.current = false;
          setLocation("/onboarding");
        });
      return;
    }

    // Interrupted flow with no captured role — fall back to the picker.
    clearPendingRole();
    handled.current = true;
    setLocation("/onboarding");
  }, [isLoaded, isLoading, isSignedIn, profile, setRole, setLocation]);

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
