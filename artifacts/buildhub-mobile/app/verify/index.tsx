import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  GradientButton,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";

const SKILLS: { value: string; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "data", label: "Data" },
  { value: "devops", label: "DevOps" },
];

const STEPS = [
  { n: "01", label: "You apply and choose your primary skill" },
  { n: "02", label: "Admin assigns a 72-hour coding challenge" },
  { n: "03", label: "You submit your work with a live demo link" },
  { n: "04", label: "Admin reviews and conducts a live video call" },
];

export default function VerifyApplyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [skill, setSkill] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Builder Verification" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Builder Verification" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}>
          <Card style={{ alignItems: "center", paddingVertical: 32, marginTop: 40 }}>
            <View style={[styles.warnIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="alert-circle" size={26} color={colors.warning} />
            </View>
            <Text style={[styles.signInTitle, { color: colors.foreground }]}>Sign in to apply</Text>
            <Text style={[styles.signInSub, { color: colors.mutedForeground }]}>
              You need to be signed in to apply for verification.
            </Text>
            <GradientButton
              label="Sign in"
              icon="log-in"
              onPress={() => router.push("/(auth)/sign-in" as Href)}
              style={{ marginTop: 20, alignSelf: "stretch" }}
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!skill) {
      setError("Please select your primary skill.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/verify/apply", {
        method: "POST",
        body: JSON.stringify({ primary_skill: skill }),
      });
      router.replace("/verify/status" as Href);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong. Please try again.";
      if (msg.includes("active application")) {
        router.replace("/verify/status" as Href);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Builder";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Builder Verification" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Builder Verification</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Apply for Builder Verification
        </Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Verification means a BuildHub admin has reviewed your work and confirmed you can ship
          real software. The badge is earned — not self-assigned. Here&apos;s how it works:
        </Text>

        <Card style={{ marginTop: 22 }}>
          {STEPS.map((s) => (
            <View key={s.n} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.stepBadgeText, { color: colors.primary }]}>{s.n}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: 18 }}>
          <View style={styles.userRow}>
            <View style={[styles.userIcon, { backgroundColor: colors.primary }]}>
              <Feather name="shield" size={18} color={colors.primaryForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                {displayName}
              </Text>
              {email ? (
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={[styles.label, { color: colors.foreground, marginTop: 22 }]}>
            What is your primary skill?
          </Text>
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>
            Choose the skill you want to be verified in. You&apos;ll receive a challenge specific to
            this area.
          </Text>

          <View style={styles.skillsGrid}>
            {SKILLS.map((s) => {
              const active = skill === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setSkill(s.value)}
                  style={({ pressed }) => [
                    styles.skillBtn,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.secondary : colors.card,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  testID={`skill-${s.value}`}
                >
                  {active ? (
                    <Feather name="check-circle" size={14} color={colors.primary} />
                  ) : null}
                  <Text
                    style={[
                      styles.skillBtnText,
                      {
                        color: active ? colors.primary : colors.foreground,
                        fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.secondary, borderColor: colors.destructive },
              ]}
            >
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <GradientButton
            label="Start Verification"
            icon="arrow-right"
            onPress={handleSubmit}
            loading={loading}
            disabled={!skill}
            style={{ marginTop: 20 }}
            testID="verify-apply-submit"
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  intro: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 21 },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 14 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  stepText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, paddingTop: 7 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  userIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18, marginBottom: 12 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: "30%",
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  skillBtnText: { fontSize: 13 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  warnIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  signInTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 6 },
  signInSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
