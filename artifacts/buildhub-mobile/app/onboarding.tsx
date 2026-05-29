import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  GradientButton,
} from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

type Role = "builder" | "startup" | "company";

const ROLES: {
  id: Role;
  title: string;
  subtitle: string;
  icon: any;
  bullets: string[];
}[] = [
  {
    id: "builder",
    title: "I'm a Builder",
    subtitle: "I ship software and want to prove my execution track record.",
    icon: "code",
    bullets: [
      "Get a verified builder profile",
      "Showcase your projects & contributions",
      "Receive company hire requests",
      "Apply for the Verified Builder badge",
    ],
  },
  {
    id: "startup",
    title: "I'm a Startup Founder",
    subtitle: "I'm building a product and want visibility in the East African tech scene.",
    icon: "zap",
    bullets: [
      "List your startup in the directory",
      "Post updates as you ship",
      "Get upvotes from the community",
      "Access paid marketing packages",
    ],
  },
  {
    id: "company",
    title: "I'm Hiring",
    subtitle: "I need to find reliable builders from a trusted community.",
    icon: "briefcase",
    bullets: [
      "Browse verified builder profiles",
      "Filter by skill, availability & location",
      "Post a hire request",
      "Get hand-picked matches from the team",
    ],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();

  const [selected, setSelected] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.firstName || "there";

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/me", {
        method: "POST",
        body: JSON.stringify({ role: selected }),
      });
      router.replace(`/portal/${selected}` as any);
    } catch (e: any) {
      setError(e?.message || "Failed to save role");
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Onboarding" />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Onboarding" />
        <View style={styles.centerFill}>
          <Feather name="lock" size={36} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Sign in to continue</Text>
          <Text style={[styles.gateMsg, { color: colors.mutedForeground }]}>
            You need an account to set your role.
          </Text>
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Welcome to BuildHub" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Get started</Text>
        <Text style={[styles.h1, { color: colors.foreground }]}>
          Hey {firstName}, what brings you here?
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Choose your role — we&apos;ll set up your personal portal.
        </Text>

        <View style={{ gap: 12, marginTop: 24 }}>
          {ROLES.map((r) => {
            const active = selected === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setSelected(r.id)}
                style={({ pressed }) => [
                  styles.roleCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderWidth: active ? 2 : 1,
                  },
                  pressed && { opacity: 0.85 },
                ]}
                testID={`onb-role-${r.id}`}
              >
                <View style={styles.roleHeader}>
                  <View style={[styles.roleIcon, { backgroundColor: colors.accent }]}>
                    <Feather name={r.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleTitle, { color: colors.foreground }]}>{r.title}</Text>
                    <Text style={[styles.roleSub, { color: colors.mutedForeground }]}>{r.subtitle}</Text>
                  </View>
                  {active ? (
                    <Feather name="check-circle" size={22} color={colors.primary} />
                  ) : (
                    <Feather name="circle" size={22} color={colors.border} />
                  )}
                </View>
                <View style={{ gap: 6, marginTop: 12 }}>
                  {r.bullets.map((b) => (
                    <View key={b} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: active ? colors.primary : colors.border }]} />
                      <Text style={[styles.bulletText, { color: colors.mutedForeground }]}>{b}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text style={[styles.errText, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        <GradientButton
          label={saving ? "Setting up your portal…" : "Continue to my portal"}
          icon={saving ? undefined : "arrow-right"}
          onPress={handleContinue}
          disabled={!selected}
          loading={saving}
          style={{ marginTop: 24 }}
          testID="onb-continue"
        />

        <Text style={[styles.foot, { color: colors.mutedForeground }]}>
          You can always change this later from your settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 16 },
  gateMsg: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 6, textAlign: "center" },
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5, marginTop: 6 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 14.5, marginTop: 8, lineHeight: 21 },
  roleCard: { borderRadius: 18, padding: 18 },
  roleHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  roleIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roleTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  roleSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3, lineHeight: 18 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  bulletText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, flex: 1 },
  errText: { fontFamily: "Inter_500Medium", fontSize: 13.5, marginTop: 16, textAlign: "center" },
  foot: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 14, textAlign: "center" },
});
