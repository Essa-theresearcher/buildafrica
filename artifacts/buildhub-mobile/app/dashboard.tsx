import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { DetailHeader, GradientButton } from "@/components/ui";
import { useMyProfile } from "@/hooks/useProfile";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, role, loading, isLoaded, isSignedIn } = useMyProfile();

  useEffect(() => {
    if (!isLoaded || loading) return;
    if (!isSignedIn) return;
    if (!profile) {
      router.replace("/onboarding" as any);
      return;
    }
    if (role === "builder") router.replace("/portal/builder" as any);
    else if (role === "startup") router.replace("/portal/startup" as any);
    else if (role === "company") router.replace("/portal/company" as any);
    else router.replace("/onboarding" as any);
  }, [isLoaded, loading, isSignedIn, profile, role, router]);

  if (!isLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Dashboard" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            Loading your portal…
          </Text>
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Dashboard" />
        <View style={styles.center}>
          <Feather name="lock" size={36} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Sign in required</Text>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            Sign in to view your personal BuildHub portal.
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
      <DetailHeader title="Dashboard" />
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>Redirecting…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 16 },
  muted: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
});
