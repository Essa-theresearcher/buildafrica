import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  EmptyState,
  GradientButton,
  OutlineButton,
  Pill,
  SectionTitle,
} from "@/components/ui";
import { apiFetch, type Startup, type StartupUpdate } from "@/lib/api";
import { useMyProfile } from "@/hooks/useProfile";
import { useColors } from "@/hooks/useColors";

interface MarketingPackage {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  price_usd: number;
  description?: string;
}

const stageColors: Record<string, { bg: string; fg: string }> = {
  idea: { bg: "#fef3c7", fg: "#92400e" },
  building: { bg: "#dbeafe", fg: "#1e40af" },
  launched: { bg: "#dcfce7", fg: "#166534" },
  scaling: { bg: "#ede9fe", fg: "#5b21b6" },
};

const updateTypeMeta: Record<string, { label: string; icon: any; bg: string; fg: string }> = {
  shipped: { label: "Shipped", icon: "package", bg: "#dcfce7", fg: "#166534" },
  milestone: { label: "Milestone", icon: "flag", bg: "#ede9fe", fg: "#5b21b6" },
  setback: { label: "Setback", icon: "alert-triangle", bg: "#fee2e2", fg: "#991b1b" },
  looking_for: { label: "Looking for", icon: "search", bg: "#dbeafe", fg: "#1e40af" },
  general: { label: "Update", icon: "message-circle", bg: "#f1f5f9", fg: "#475569" },
};

export default function StartupPortalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useUser();
  const { role, loading: roleLoading, isLoaded, isSignedIn } = useMyProfile();
  const firstName = user?.firstName || "Founder";

  const [startup, setStartup] = useState<Startup | null>(null);
  const [updates, setUpdates] = useState<StartupUpdate[]>([]);
  const [packages, setPackages] = useState<MarketingPackage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isSignedIn || role !== "startup") return;
    setLoading(true);
    try {
      const my = await apiFetch<{ startup: Startup | null }>("/api/startups/my/startup").catch(
        () => ({ startup: null }),
      );
      setStartup(my?.startup ?? null);
      if (my?.startup?.id) {
        const u = await apiFetch<{ updates: StartupUpdate[] }>(
          `/api/startups/${my.startup.id}/updates`,
        ).catch(() => ({ updates: [] }));
        setUpdates(u.updates || []);
      }
      const pk = await apiFetch<{ packages: MarketingPackage[] }>(
        "/api/marketing/packages",
      ).catch(() => ({ packages: [] }));
      setPackages(pk.packages || []);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, role]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isLoaded || roleLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup Portal" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup Portal" />
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

  if (role !== "startup") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup Portal" />
        <View style={styles.center}>
          <Feather name="user-x" size={36} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>
            This is the Startup portal
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup Portal" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading your startup…</Text>
        </View>
      </View>
    );
  }

  if (!startup) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup Portal" />
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Startup Portal</Text>
          <Text style={[styles.h1, { color: colors.foreground }]}>Welcome, {firstName}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            You haven&apos;t listed a startup yet. Add yours to get visibility in the East African
            tech scene.
          </Text>

          <GradientButton
            label="List your startup"
            icon="zap"
            onPress={() => router.push("/startup/new" as any)}
            style={{ marginTop: 24 }}
          />

          <Card style={{ marginTop: 24 }}>
            <View style={{ alignItems: "center" }}>
              <View style={[styles.heroIcon, { backgroundColor: colors.accent }]}>
                <Feather name="zap" size={26} color={colors.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>
                Your startup portal awaits
              </Text>
              <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
                Once you list your startup, you&apos;ll see live stats (views, upvotes), post product
                updates, manage your team, and access paid marketing packages.
              </Text>
              <View style={{ gap: 8, marginTop: 16, alignSelf: "stretch" }}>
                {[
                  "Live view & upvote tracking",
                  "Post product updates",
                  "Featured marketing slots",
                  "Team management",
                ].map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather name="check" size={14} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  const sc = stageColors[startup.stage] || { bg: colors.secondary, fg: colors.mutedForeground };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Startup Portal" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Startup Portal</Text>
        <Text style={[styles.h1, { color: colors.foreground }]}>{startup.name}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{startup.tagline}</Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1 }}>
            <OutlineButton
              label="Public page"
              icon="external-link"
              onPress={() => router.push(`/startup/${startup.slug}` as any)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <GradientButton
              label="Promote"
              icon="trending-up"
              onPress={() => router.push(`/promote/${startup.slug}` as any)}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard as any}>
            <Feather name="eye" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{startup.total_views ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Views</Text>
          </Card>
          <Card style={styles.statCard as any}>
            <Feather name="arrow-up" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{startup.total_upvotes ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Upvotes</Text>
          </Card>
          <Card style={styles.statCard as any}>
            <Feather name="edit-3" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{updates.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Updates</Text>
          </Card>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          <Pill label={startup.stage} bg={sc.bg} fg={sc.fg} />
          {startup.is_hiring ? (
            <Pill label="Hiring" bg="#d1fae5" fg="#065f46" icon="user-plus" />
          ) : null}
        </View>

        {/* Updates */}
        <SectionTitle title="Recent updates" />
        {updates.length === 0 ? (
          <Card>
            <EmptyState
              icon="edit-3"
              title="No updates yet"
              message="Share what you've shipped or what you're working on."
            />
            <GradientButton
              label="Post first update"
              icon="plus"
              onPress={() => router.push(`/startup/${startup.slug}` as any)}
              style={{ marginTop: 8 }}
            />
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {updates.slice(0, 4).map((u) => {
              const meta = updateTypeMeta[u.update_type] || updateTypeMeta.general;
              return (
                <Card key={u.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <Pill label={meta.label} bg={meta.bg} fg={meta.fg} icon={meta.icon} />
                    <Text style={[styles.updateDate, { color: colors.mutedForeground }]}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.updateTitle, { color: colors.foreground }]}>{u.title}</Text>
                  <Text style={[styles.updateBody, { color: colors.mutedForeground }]} numberOfLines={3}>
                    {u.body}
                  </Text>
                </Card>
              );
            })}
          </View>
        )}

        {/* Marketing packages */}
        <SectionTitle title="Marketing packages" />
        {packages.length === 0 ? (
          <Card>
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              No packages available right now.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {packages.map((pkg) => (
              <Card key={pkg.id || pkg.slug} onPress={() => router.push(`/promote/${startup.slug}` as any)}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={[styles.pkgName, { color: colors.foreground }]} numberOfLines={1}>
                    {pkg.name}
                  </Text>
                  <Text style={[styles.pkgPrice, { color: colors.primary }]}>${pkg.price_usd}</Text>
                </View>
                <Text style={[styles.pkgDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {pkg.tagline}
                </Text>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 14 }} />
        <OutlineButton
          label="View startup directory"
          icon="grid"
          onPress={() => router.push("/(tabs)/startups" as any)}
        />
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
  statsRow: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 18 },
  statCard: { flex: 1, padding: 14, alignItems: "flex-start" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 6 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  heroIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 14, textAlign: "center" },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, marginTop: 8, textAlign: "center" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontFamily: "Inter_500Medium", fontSize: 13.5 },
  updateDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  updateTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginTop: 10 },
  updateBody: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, marginTop: 6 },
  pkgName: { fontFamily: "Inter_700Bold", fontSize: 15, flex: 1 },
  pkgPrice: { fontFamily: "Inter_700Bold", fontSize: 15 },
  pkgDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
});
