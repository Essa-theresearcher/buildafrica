import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
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
import { builders, companyRequests } from "@/data/seed";
import { useMyProfile } from "@/hooks/useProfile";
import { useColors } from "@/hooks/useColors";

export default function CompanyPortalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useUser();
  const { role, loading: roleLoading, isLoaded, isSignedIn } = useMyProfile();
  const firstName = user?.firstName || "there";

  if (!isLoaded || roleLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Company Portal" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Company Portal" />
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

  if (role !== "company") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Company Portal" />
        <View style={styles.center}>
          <Feather name="user-x" size={36} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>
            This is the Company portal
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

  const featuredBuilders = builders.slice(0, 4);
  const reqs = companyRequests.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Company Portal" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Company Portal</Text>
        <Text style={[styles.h1, { color: colors.foreground }]}>Find your builder, {firstName}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Browse verified builders from the East African tech community.
        </Text>

        <GradientButton
          label="Post a hire request"
          icon="plus-circle"
          onPress={() => router.push("/request" as any)}
          style={{ marginTop: 20 }}
        />
        <View style={{ height: 10 }} />
        <OutlineButton
          label="Browse all builders"
          icon="users"
          onPress={() => router.push("/(tabs)/builders" as any)}
        />

        {/* Featured builders preview */}
        <SectionTitle title="Featured builders" />
        <View style={{ gap: 10 }}>
          {featuredBuilders.map((b) => (
            <Card key={b.id} onPress={() => router.push(`/builder/${b.username}` as any)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar name={b.name} size={48} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.builderName, { color: colors.foreground }]} numberOfLines={1}>
                      {b.name}
                    </Text>
                    {b.verificationStatus === "Verified" ? (
                      <Feather name="shield" size={14} color={colors.primary} />
                    ) : null}
                  </View>
                  <Text style={[styles.builderRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {b.role} · {b.location}
                  </Text>
                </View>
                <Pill
                  label={b.availability}
                  bg={
                    b.availability === "Available"
                      ? "#dcfce7"
                      : b.availability === "Limited"
                        ? "#fef3c7"
                        : "#f1f5f9"
                  }
                  fg={
                    b.availability === "Available"
                      ? "#166534"
                      : b.availability === "Limited"
                        ? "#92400e"
                        : "#475569"
                  }
                />
              </View>
            </Card>
          ))}
        </View>

        {/* Your hire requests */}
        <SectionTitle title="Your hire requests" />
        <View style={{ gap: 10 }}>
          {reqs.map((req) => (
            <Card key={req.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <View style={[styles.reqIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="briefcase" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.reqCompany, { color: colors.foreground }]} numberOfLines={1}>
                    {req.companyName}
                  </Text>
                  <Text style={[styles.reqRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {req.roleNeeded}
                  </Text>
                </View>
              </View>
              <Text style={[styles.reqTimeline, { color: colors.mutedForeground }]} numberOfLines={2}>
                {req.timeline}
              </Text>
              <View style={[styles.reqFoot, { borderTopColor: colors.border }]}>
                <Text style={[styles.reqBudget, { color: colors.primary }]}>{req.budgetRange}</Text>
                <Pill label={req.status} bg="#dcfce7" fg="#166534" />
              </View>
            </Card>
          ))}
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
  builderName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  builderRole: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 2 },
  reqIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reqCompany: { fontFamily: "Inter_700Bold", fontSize: 14 },
  reqRole: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  reqTimeline: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  reqFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  reqBudget: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
