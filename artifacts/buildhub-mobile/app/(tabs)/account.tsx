import { Feather } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  GradientButton,
  GradientHeader,
  OutlineButton,
} from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

type Role = "builder" | "startup" | "company";

const ROLES: { key: Role; title: string; desc: string; icon: any }[] = [
  { key: "builder", title: "Builder", desc: "Showcase shipped work and get verified", icon: "tool" },
  { key: "startup", title: "Startup", desc: "Launch your venture and find builders", icon: "zap" },
  { key: "company", title: "Company", desc: "Hire trusted builders for your team", icon: "briefcase" },
];

export default function AccountScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Role | null>(null);

  const loadProfile = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const { profile } = await apiFetch<{ profile: { role: Role } | null }>("/api/me");
      setRole(profile?.role ?? null);
    } catch {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const pickRole = async (r: Role) => {
    setSaving(r);
    try {
      const { profile } = await apiFetch<{ profile: { role: Role } }>("/api/me", {
        method: "POST",
        body: JSON.stringify({ role: r }),
      });
      setRole(profile.role);
    } catch {
      // leave role unchanged on failure
    } finally {
      setSaving(null);
    }
  };

  // ── Signed-out state ─────────────────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <GradientHeader title="Account" subtitle="Join the trusted builder community" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}>
          <View style={styles.signedOut}>
            <LinearGradient
              colors={[colors.gradientFrom, colors.gradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bigLogo}
            >
              <Feather name="box" size={34} color="#fff" />
            </LinearGradient>
            <Text style={[styles.signedOutTitle, { color: colors.foreground }]}>
              Sign in to BuildHub
            </Text>
            <Text style={[styles.signedOutSub, { color: colors.mutedForeground }]}>
              Create a profile, get verified, and showcase the projects you&apos;ve shipped.
            </Text>
            <GradientButton
              label="Sign in"
              icon="log-in"
              onPress={() => router.push("/(auth)/sign-in" as Href)}
              style={{ marginTop: 24, alignSelf: "stretch" }}
              testID="account-signin"
            />
            <OutlineButton
              label="Create account"
              onPress={() => router.push("/(auth)/sign-up" as Href)}
              style={{ marginTop: 12, alignSelf: "stretch" }}
              testID="account-signup"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Signed-in state ──────────────────────────────────────────────────────────
  const displayName = user?.fullName || user?.firstName || "Builder";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader title="My Portal" subtitle="Manage your BuildHub presence" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Avatar name={displayName} size={58} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                {displayName}
              </Text>
              {email ? (
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              {role ? (
                <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          {role ? "Switch role" : "Choose your role"}
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          This tailors your BuildHub experience.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : (
          <View style={{ gap: 12, marginTop: 14 }}>
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => pickRole(r.key)}
                  disabled={saving !== null}
                  style={({ pressed }) => [
                    styles.roleCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: active ? colors.primary : colors.border,
                      borderWidth: active ? 2 : 1,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  testID={`role-${r.key}`}
                >
                  <View style={[styles.roleIcon, { backgroundColor: colors.accent }]}>
                    <Feather name={r.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleTitle, { color: colors.foreground }]}>{r.title}</Text>
                    <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{r.desc}</Text>
                  </View>
                  {saving === r.key ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : active ? (
                    <Feather name="check-circle" size={22} color={colors.primary} />
                  ) : (
                    <Feather name="circle" size={22} color={colors.border} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 24 }} />
        <OutlineButton
          label="Sign out"
          icon="log-out"
          onPress={() => signOut()}
          testID="sign-out"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  signedOut: { alignItems: "center", paddingVertical: 40 },
  bigLogo: { width: 80, height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  signedOutTitle: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 22 },
  signedOutSub: { fontFamily: "Inter_400Regular", fontSize: 14.5, textAlign: "center", marginTop: 8, lineHeight: 21, paddingHorizontal: 10 },
  userName: { fontFamily: "Inter_700Bold", fontSize: 18 },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 13.5, marginTop: 2 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  roleBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 18 },
  sectionHint: { fontFamily: "Inter_400Regular", fontSize: 13.5, marginTop: 4 },
  roleCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, padding: 16 },
  roleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roleTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  roleDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2, lineHeight: 18 },
});
