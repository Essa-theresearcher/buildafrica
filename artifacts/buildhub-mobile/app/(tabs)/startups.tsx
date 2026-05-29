import { Feather } from "@expo/vector-icons";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  EmptyState,
  ErrorState,
  FilterChip,
  GradientHeader,
  Pill,
  SearchBar,
  Skeleton,
} from "@/components/ui";
import { apiFetch, type Startup, type StartupStats } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

const stageColors: Record<string, { bg: string; fg: string }> = {
  idea: { bg: "#fef3c7", fg: "#92400e" },
  building: { bg: "#dbeafe", fg: "#1e40af" },
  launched: { bg: "#dcfce7", fg: "#166534" },
  scaling: { bg: "#ede9fe", fg: "#5b21b6" },
};

export default function StartupsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [startups, setStartups] = useState<Startup[]>([]);
  const [stats, setStats] = useState<StartupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, s] = await Promise.all([
        apiFetch<{ startups: Startup[] }>("/api/startups"),
        apiFetch<StartupStats>("/api/startups/stats").catch(() => null),
      ]);
      setStartups(list.startups || []);
      if (s) setStats(s);
    } catch (e: any) {
      setError(e?.message || "Failed to load startups");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return startups.filter((st) => {
      if (stage !== "all" && st.stage !== stage) return false;
      if (!q) return true;
      return (
        st.name.toLowerCase().includes(q) ||
        st.tagline.toLowerCase().includes(q) ||
        st.category.toLowerCase().includes(q)
      );
    });
  }, [startups, query, stage]);

  const renderItem = ({ item: st }: { item: Startup }) => {
    const sc = stageColors[st.stage] || { bg: colors.secondary, fg: colors.mutedForeground };
    return (
      <Card onPress={() => router.push(`/startup/${st.slug}` as Href)} testID={`startup-${st.slug}`} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <Avatar name={st.name} size={52} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {st.name}
              </Text>
              <Pill label={st.stage} bg={sc.bg} fg={sc.fg} />
            </View>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]} numberOfLines={2}>
              {st.tagline}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="arrow-up" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{st.total_upvotes}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="eye" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{st.total_views}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="tag" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{st.category}</Text>
          </View>
          {st.is_hiring ? <Pill label="Hiring" bg="#d1fae5" fg="#065f46" icon="user-plus" /> : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader title="Startups" subtitle="Ventures built by the community">
        {stats ? (
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.startup_count}</Text>
              <Text style={styles.heroStatLabel}>Startups</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.builder_count}</Text>
              <Text style={styles.heroStatLabel}>Builders</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.launched_count}</Text>
              <Text style={styles.heroStatLabel}>Launched</Text>
            </View>
          </View>
        ) : null}
      </GradientHeader>

      {loading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} />
          ))}
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(st) => st.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: CONTENT_BOTTOM_PAD }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <SearchBar value={query} onChangeText={setQuery} placeholder="Search startups" />
              <View style={styles.filters}>
                {(["all", "idea", "building", "launched", "scaling"]).map((f) => (
                  <FilterChip
                    key={f}
                    label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    active={stage === f}
                    onPress={() => setStage(f)}
                  />
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState icon="zap" title="No startups yet" message="Be the first to launch a venture here." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: "Inter_600SemiBold", fontSize: 16, flex: 1 },
  tagline: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 14, marginTop: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  heroStats: { flexDirection: "row", alignItems: "center", marginTop: 18, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingVertical: 12 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20 },
  heroStatLabel: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 11.5, marginTop: 2 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.25)" },
});
