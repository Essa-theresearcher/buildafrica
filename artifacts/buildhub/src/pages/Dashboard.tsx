import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useMyProfile } from "@/hooks/useMyProfile";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const { profile, isLoading } = useMyProfile();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoaded || isLoading) return;

    if (!isSignedIn) {
      setLocation("/sign-in");
      return;
    }

    if (!profile) {
      setLocation("/onboarding");
      return;
    }

    if (profile.role === "builder") setLocation("/portal/builder");
    else if (profile.role === "startup") setLocation("/portal/startup");
    else if (profile.role === "company") setLocation("/portal/company");
    else setLocation("/onboarding");
  }, [isLoaded, isLoading, isSignedIn, profile, setLocation]);

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
