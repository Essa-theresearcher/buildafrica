import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  GradientButton,
  OutlineButton,
  Pill,
  SectionTitle,
} from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useMyProfile } from "@/hooks/useProfile";
import { useColors } from "@/hooks/useColors";

const statusMeta: Record<string, { label: string; icon: any; bg: string; fg: string; desc: string }> = {
  pending: {
    label: "Application Pending",
    icon: "clock",
    bg: "#fef3c7",
    fg: "#92400e",
    desc: "Your application is under review. Admin will assign a challenge shortly.",
  },
  challenge_assigned: {
    label: "Challenge Assigned",
    icon: "layers",
    bg: "#ede9fe",
    fg: "#5b21b6",
    desc: "You have an active challenge to complete. Submit your work before the deadline.",
  },
  submitted: {
    label: "Work Submitted",
    icon: "check-circle",
    bg: "#dcfce7",
    fg: "#166534",
    desc: "Your submission is in review. Admin will schedule a call with you.",
  },
  call_scheduled: {
    label: "Review Call Scheduled",
    icon: "clock",
    bg: "#ede9fe",
    fg: "#5b21b6",
    desc: "Your review call is booked. Check your email for details.",
  },
  passed: {
    label: "Verified Builder",
    icon: "shield",
    bg: "#dcfce7",
    fg: "#166534",
    desc: "You've earned the Verified Builder badge. It's shown on your profile.",
  },
  failed: {
    label: "Verification Not Passed",
    icon: "x-circle",
    bg: "#fee2e2",
    fg: "#991b1b",
    desc: "You can re-apply after 30 days.",
  },
};

export default function BuilderPortalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useUser();
  const { role, loading: roleLoading, isLoaded, isSignedIn } = useMyProfile();
  const firstName = user?.firstName || "Builder";

  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
  const [vLoading, setVLoading] = useState(false);

  const loadVerify = useCallback(async () => {
    if (!isSignedIn || role !== "builder") return;
    setVLoading(true);
    try {
      const data = await apiFetch<{ application: { status?: string } | null }>("/api/verify/status");
      setVerifyStatus(data?.application?.status ?? null);
    } catch {
      setVerifyStatus(null);
    } finally {
      setVLoading(false);
    }
  }, [isSignedIn, role]);

  useEffect(() => {
    loadVerify();
  }, [loadVerify]);

  if (!isLoaded || roleLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Builder Portal" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Builder Portal" />
        <View style={styles.center}>
          <Feather name="lock" size={36} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Sign in required</Text>
          <GradientButton
            label="Sign in"
            icon="log-in"
            onPress={() => router.push("/(auth)/sign-in" as any)}
            style={{ marginTop: 20, alignSelf: "stretch" }}
          />
        </View>
      </View>
    );
  }

  if (role !== "builder") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Builder Portal" />
        <View style={styles.center}>
          <Feather name="user-x" size={36} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>
            This is the Builder portal
          </Text>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            Your role is {role ?? "not set"}.
          </Text>
          <OutlineButton
            label="Go to dashboard"
            icon="arrow-right"
            onPress={() => router.replace("/dashboard" as any)}
            style={{ marginTop: 20, alignSelf: "stretch" }}
          />
        </View>
      </View>
    );
  }

  const cfg = verifyStatus ? statusMeta[verifyStatus] : null;
  const displayName = user?.fullName || firstName;
  const username = (user?.username || user?.id || "").toString();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Builder Portal" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Builder Portal</Text>
        <Text style={[styles.h1, { color: colors.foreground }]}>Welcome back, {firstName}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Your builder workspace — profile, verification, projects, and incoming requests.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard as any}>
            <Feather name="layers" size={18} color={colors.primary} />
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Projects</Text>
            </View>
          </Card>
          <Card style={styles.statCard as any}>
            <Feather name="briefcase" size={18} color={colors.primary} />
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Requests</Text>
            </View>
          </Card>
          <Card style={styles.statCard as any}>
            <Feather name="shield" size={18} color={colors.primary} />
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {verifyStatus === "passed" ? "Yes" : "No"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Verified</Text>
            </View>
          </Card>
        </View>

        {/* Verification card */}
        <SectionTitle title="Verification status" />
        {vLoading ? (
          <Card><ActivityIndicator color={colors.primary} /></Card>
        ) : !verifyStatus || verifyStatus === "none" ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={[styles.verifyIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="shield" size={22} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifyTitle, { color: colors.foreground }]}>Not verified yet</Text>
                <Text style={[styles.verifyDesc, { color: colors.mutedForeground }]}>
                  Complete the verification challenge to earn your Verified Builder badge and stand out
                  to companies.
                </Text>
              </View>
            </View>
            <GradientButton
              label="Apply for Verification"
              icon="shield"
              onPress={() => router.push("/verify" as any)}
              style={{ marginTop: 14 }}
            />
          </Card>
        ) : (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={[styles.verifyIcon, { backgroundColor: cfg?.bg || colors.secondary }]}>
                <Feather name={cfg?.icon || "shield"} size={22} color={cfg?.fg || colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifyTitle, { color: cfg?.fg || colors.foreground }]}>
                  {cfg?.label || verifyStatus}
                </Text>
                <Text style={[styles.verifyDesc, { color: colors.mutedForeground }]}>
                  {cfg?.desc || "Check your verification status for details."}
                </Text>
              </View>
            </View>
            {(verifyStatus === "challenge_assigned" || verifyStatus === "submitted") ? (
              <GradientButton
                label="View challenge"
                icon="external-link"
                onPress={() => router.push("/verify/status" as any)}
                style={{ marginTop: 14 }}
              />
            ) : (
              <OutlineButton
                label="View status"
                icon="info"
                onPress={() => router.push("/verify/status" as any)}
                style={{ marginTop: 14 }}
              />
            )}
          </Card>
        )}

        {/* Profile quick view */}
        <SectionTitle title="Your profile" />
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Avatar name={displayName} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.foreground }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.profileRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                Builder · BuildHub
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            <Pill label="Builder" bg="#ede9fe" fg="#5b21b6" icon="user" />
            {verifyStatus === "passed" ? (
              <Pill label="Verified" bg="#dcfce7" fg="#166534" icon="check-circle" />
            ) : null}
          </View>
          <OutlineButton
            label="View public profile"
            icon="external-link"
            onPress={() => router.push(`/builder/${username}` as any)}
            style={{ marginTop: 14 }}
          />
        </Card>

        <SectionTitle title="Quick actions" />
        <View style={{ gap: 10 }}>
          <OutlineButton
            label="Manage projects"
            icon="layers"
            onPress={() => router.push("/(tabs)/projects" as any)}
          />
          <OutlineButton
            label="Browse builders"
            icon="users"
            onPress={() => router.push("/(tabs)/builders" as any)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 16 },
  muted: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5, marginTop: 6 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 14.5, marginTop: 8, lineHeight: 21 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 24 },
  statCard: { flex: 1, padding: 14, gap: 8 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 6 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  verifyIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  verifyTitle: { fontFamily: "Inter_700Bold", fontSize: 15.5 },
  verifyDesc: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19, marginTop: 4 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 17 },
  profileRole: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
});
