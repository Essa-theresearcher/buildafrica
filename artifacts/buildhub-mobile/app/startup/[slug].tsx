import { Feather } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  ErrorState,
  OutlineButton,
  Pill,
  SectionTitle,
  Skeleton,
  SkillChip,
} from "@/components/ui";
import { apiFetch, type Startup, type StartupUpdate } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

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

export default function StartupDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isSignedIn } = useAuth();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [updates, setUpdates] = useState<StartupUpdate[]>([]);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { startup: s } = await apiFetch<{ startup: Startup }>(`/api/startups/${slug}`);
      setStartup(s);
      // Fire-and-forget view counter + parallel fetch of updates/upvote-status.
      apiFetch(`/api/startups/${s.id}/view`, { method: "POST" }).catch(() => {});
      const [u, status] = await Promise.all([
        apiFetch<{ updates: StartupUpdate[] }>(`/api/startups/${s.id}/updates`).catch(() => ({ updates: [] })),
        isSignedIn
          ? apiFetch<{ upvoted: boolean }>(`/api/startups/${s.id}/upvote-status`).catch(() => ({ upvoted: false }))
          : Promise.resolve({ upvoted: false }),
      ]);
      setUpdates(u.updates || []);
      setUpvoted(status.upvoted);
    } catch (e: any) {
      setError(e?.message || "Failed to load startup");
    } finally {
      setLoading(false);
    }
  }, [slug, isSignedIn]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleUpvote = async () => {
    if (!startup) return;
    if (!isSignedIn) {
      router.push("/(auth)/sign-in" as Href);
      return;
    }
    setVoting(true);
    const prev = upvoted;
    setUpvoted(!prev);
    setStartup((s) => (s ? { ...s, total_upvotes: s.total_upvotes + (prev ? -1 : 1) } : s));
    try {
      await apiFetch(`/api/startups/${startup.id}/upvote`, { method: "POST" });
    } catch {
      setUpvoted(prev);
      setStartup((s) => (s ? { ...s, total_upvotes: s.total_upvotes + (prev ? 1 : -1) } : s));
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup" />
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton height={120} />
          <Skeleton height={60} />
          <Skeleton height={140} />
        </View>
      </View>
    );
  }

  if (error || !startup) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Startup" />
        <ErrorState message={error || "Startup not found"} onRetry={load} />
      </View>
    );
  }

  const sc = stageColors[startup.stage] || { bg: colors.secondary, fg: colors.mutedForeground };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title={startup.name} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={startup.name} size={68} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>{startup.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Pill label={startup.stage} bg={sc.bg} fg={sc.fg} />
              {startup.is_hiring ? <Pill label="Hiring" bg="#d1fae5" fg="#065f46" icon="user-plus" /> : null}
            </View>
          </View>
        </View>

        <Text style={[styles.tagline, { color: colors.foreground }]}>{startup.tagline}</Text>

        <View style={styles.metaRow}>
          <Pressable
            onPress={toggleUpvote}
            disabled={voting}
            style={({ pressed }) => [
              styles.upvoteBtn,
              {
                backgroundColor: upvoted ? colors.primary : colors.card,
                borderColor: upvoted ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            testID="upvote-startup"
          >
            <Feather name="arrow-up" size={16} color={upvoted ? "#fff" : colors.foreground} />
            <Text style={[styles.upvoteText, { color: upvoted ? "#fff" : colors.foreground }]}>
              {startup.total_upvotes}
            </Text>
          </Pressable>
          <View style={styles.viewsItem}>
            <Feather name="eye" size={15} color={colors.mutedForeground} />
            <Text style={[styles.viewsText, { color: colors.mutedForeground }]}>{startup.total_views} views</Text>
          </View>
        </View>

        <View style={styles.linksRow}>
          {startup.product_url ? (
            <OutlineButton label="Product" icon="external-link" onPress={() => Linking.openURL(startup.product_url!)} style={{ flex: 1 }} />
          ) : null}
          {startup.demo_url ? (
            <OutlineButton label="Demo" icon="play-circle" onPress={() => Linking.openURL(startup.demo_url!)} style={{ flex: 1 }} />
          ) : null}
          {startup.github_url ? (
            <OutlineButton label="Code" icon="github" onPress={() => Linking.openURL(startup.github_url!)} style={{ flex: 1 }} />
          ) : null}
        </View>

        <View style={styles.block}>
          <SectionTitle title="About" />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{startup.description}</Text>
        </View>

        <View style={styles.block}>
          <SectionTitle title="Problem solved" />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{startup.problem_solved}</Text>
        </View>

        {(startup.traction_users || startup.traction_revenue || startup.markets_served) ? (
          <View style={styles.block}>
            <SectionTitle title="Traction" />
            <View style={{ gap: 10 }}>
              {startup.traction_users ? (
                <TractionRow icon="users" label="Users" value={startup.traction_users} />
              ) : null}
              {startup.traction_revenue ? (
                <TractionRow icon="dollar-sign" label="Revenue" value={startup.traction_revenue} />
              ) : null}
              {startup.markets_served ? (
                <TractionRow icon="globe" label="Markets" value={startup.markets_served} />
              ) : null}
            </View>
          </View>
        ) : null}

        {startup.looking_for?.length ? (
          <View style={styles.block}>
            <SectionTitle title="Looking for" />
            <View style={styles.tagsWrap}>
              {startup.looking_for.map((l) => (
                <SkillChip key={l} label={l} />
              ))}
            </View>
          </View>
        ) : null}

        {startup.team_members?.length ? (
          <View style={styles.block}>
            <SectionTitle title="Team" />
            <View style={{ gap: 10 }}>
              {startup.team_members.map((m, i) => (
                <View
                  key={i}
                  style={[styles.teamRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Avatar name={m.builder_name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.teamName, { color: colors.foreground }]}>{m.builder_name}</Text>
                    <Text style={[styles.teamRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {m.role}
                    </Text>
                  </View>
                  {m.is_founder ? <Pill label="Founder" bg={colors.accent} fg={colors.primary} /> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <SectionTitle title={`Updates (${updates.length})`} />
          {updates.length === 0 ? (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>No updates posted yet.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {updates.map((u) => {
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
                    <Text style={[styles.updateBody, { color: colors.mutedForeground }]}>{u.body}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <Avatar name={u.posted_by_name} size={24} />
                      <Text style={[styles.updateAuthor, { color: colors.mutedForeground }]}>{u.posted_by_name}</Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TractionRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.tractionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.tractionIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.tractionLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.tractionValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.4 },
  tagline: { fontFamily: "Inter_500Medium", fontSize: 16, lineHeight: 23, marginTop: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 18 },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  upvoteText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  viewsItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  viewsText: { fontFamily: "Inter_500Medium", fontSize: 13.5 },
  linksRow: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
  block: { marginTop: 28 },
  body: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 22 },
  muted: { fontFamily: "Inter_400Regular", fontSize: 14 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tractionRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  tractionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tractionLabel: { fontFamily: "Inter_500Medium", fontSize: 13.5, flex: 1 },
  tractionValue: { fontFamily: "Inter_700Bold", fontSize: 15 },
  teamRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  teamName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  teamRole: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  updateDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  updateTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15.5, marginTop: 10 },
  updateBody: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginTop: 6 },
  updateAuthor: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
});
