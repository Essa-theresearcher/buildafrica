import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useMyProfile, type Role } from "./useMyProfile";

export function useRequireRole(allowed: Role) {
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
    if (profile.role !== allowed) {
      setLocation("/dashboard");
    }
  }, [isLoaded, isLoading, isSignedIn, profile, allowed, setLocation]);

  const ready =
    isLoaded && !isLoading && isSignedIn && !!profile && profile.role === allowed;

  return { ready, profile };
}
