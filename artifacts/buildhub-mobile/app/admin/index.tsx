import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  EmptyState,
  GradientButton,
  OutlineButton,
  SectionTitle,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { apiFetch } from "@/lib/api";

interface Application {
  id: string;
  status: string;
  primary_skill: string;
  builder_clerk_id: string;
  created_at: string;
}

interface ActivePromotion {
  id: string;
  name: string;
  marketing_tier: string;
}

export default function AdminDashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const isAdmin = useIsAdmin();

  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes, promRes, waitRes] = await Promise.all([
        apiFetch<{ applications: Application[] }>("/api/verify/admin/all?status=pending").catch(() => ({ applications: [] })),
        apiFetch<{ applications: Application[] }>("/api/verify/admin/all?status=all").catch(() => ({ applications: [] })),
        apiFetch<{ promotions: ActivePromotion[] }>("/api/marketing/admin/active").catch(() => ({ promotions: [] })),
        apiFetch<{ waitlist: any[] }>("/api/marketing/admin/waitlist").catch(() => ({ waitlist: [] })),
      ]);
      setPendingApps(pendingRes.applications || []);
      setAllApps(allRes.applications || []);
      setPromotions(promRes.promotions || []);
      setWaitlistCount((waitRes.waitlist || []).length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isAdmin) load();
  }, [isLoaded, isAdmin, load]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Admin" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Admin" />
        <View style={styles.center}>
          <Feather name="lock" size={32} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Sign in required</Text>
          <Text style={[styles.gateSub, { color: colors.mutedForeground }]}>
            Admins only — please sign in to continue.
          </Text>
          <GradientButton
            label="Sign in"
            icon="log-in"
            onPress={() => router.push("/(auth)/sign-in" as Href)}
            style={{ marginTop: 20, alignSelf: "stretch" }}
          />
        </View>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Admin" />
        <View style={styles.center}>
          <Feather name="shield-off" size={32} color={colors.destructive} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Admins only</Text>
          <Text style={[styles.gateSub, { color: colors.mutedForeground }]}>
            You don&apos;t have admin access to BuildHub.
          </Text>
          <OutlineButton
            label="Go to dashboard"
            onPress={() => router.replace("/dashboard" as Href)}
            style={{ marginTop: 20, alignSelf: "stretch" }}
          />
        </View>
      </View>
    );
  }

  const verifiedCount = allApps.filter((a) => a.status === "passed").length;
  const challengeCount = allApps.filter((a) => a.status === "challenge_assigned").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Admin Dashboard" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subhead, { color: colors.mutedForeground }]}>
          Verify builders · manage marketing · track applications.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard value={allApps.length} label="Total Applications" icon="file-text" />
              <StatCard value={verifiedCount} label="Verified Builders" icon="shield" />
              <StatCard value={pendingApps.length} label="Pending Review" icon="clock" />
              <StatCard value={challengeCount} label="In Challenge" icon="code" />
            </View>

            <View style={{ marginTop: 28 }}>
              <SectionTitle title="Pending Verifications" />
              {pendingApps.length === 0 ? (
                <EmptyState icon="check-circle" title="All caught up" message="No pending verification applications." />
              ) : (
                <View style={{ gap: 10 }}>
                  {pendingApps.slice(0, 5).map((app) => (
                    <Card key={app.id} onPress={() => router.push("/admin/verifications" as Href)}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={[styles.appIcon, { backgroundColor: colors.accent }]}>
                          <Feather name="user-check" size={16} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.appTitle, { color: colors.foreground }]} numberOfLines={1}>
                            {app.builder_clerk_id.slice(0, 24)}…
                          </Text>
                          <Text style={[styles.appSub, { color: colors.mutedForeground }]}>
                            {app.primary_skill} · {new Date(app.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                      </View>
                    </Card>
                  ))}
                  {pendingApps.length > 5 ? (
                    <Text style={[styles.appSub, { color: colors.mutedForeground, marginTop: 4 }]}>
                      +{pendingApps.length - 5} more
                    </Text>
                  ) : null}
                </View>
              )}

              <OutlineButton
                label="Review all verifications"
                icon="shield"
                onPress={() => router.push("/admin/verifications" as Href)}
                style={{ marginTop: 14 }}
              />
            </View>

            <View style={{ marginTop: 28 }}>
              <SectionTitle title="Marketing" />
              <Card>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.appIcon, { backgroundColor: colors.accent }]}>
                    <Feather name="trending-up" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.appTitle, { color: colors.foreground }]}>
                      {promotions.length} active promotions
                    </Text>
                    <Text style={[styles.appSub, { color: colors.mutedForeground }]}>
                      {waitlistCount} waitlist signups
                    </Text>
                  </View>
                </View>
              </Card>
              <OutlineButton
                label="Manage marketing"
                icon="megaphone"
                onPress={() => router.push("/admin/marketing" as Href)}
                style={{ marginTop: 12 }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: any }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 14 },
  gateSub: { fontFamily: "Inter_400Regular", fontSize: 14.5, textAlign: "center", marginTop: 8, lineHeight: 21 },
  subhead: { fontFamily: "Inter_400Regular", fontSize: 14.5, marginTop: 4, marginBottom: 20, lineHeight: 21 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { flexGrow: 1, flexBasis: "45%", borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 24, letterSpacing: -0.5 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  appIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  appTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  appSub: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 2 },
});
