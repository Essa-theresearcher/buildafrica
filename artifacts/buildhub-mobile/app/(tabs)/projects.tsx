import { Feather } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import {
  Card,
  CONTENT_BOTTOM_PAD,
  EmptyState,
  FilterChip,
  GradientHeader,
  Pill,
  SearchBar,
  SkillChip,
} from "@/components/ui";
import { builders, projects } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import type { Project } from "@/types";

type FilterKey = "all" | "Launched" | "Building" | "Idea";

const statusColors: Record<string, { bg: string; fg: string }> = {
  Launched: { bg: "#dcfce7", fg: "#166534" },
  Building: { bg: "#dbeafe", fg: "#1e40af" },
  Idea: { bg: "#fef3c7", fg: "#92400e" },
};

export default function ProjectsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  const builderName = (id: string) => builders.find((b) => b.id === id)?.name ?? "Unknown";

  const renderItem = ({ item: p }: { item: Project }) => {
    const sc = statusColors[p.status] || { bg: colors.secondary, fg: colors.mutedForeground };
    return (
      <Card onPress={() => router.push(`/project/${p.slug}` as Href)} testID={`project-${p.slug}`} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={[styles.icon, { backgroundColor: colors.accent }]}>
            <Feather name="layers" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {p.name}
              </Text>
              <Pill label={p.status} bg={sc.bg} fg={sc.fg} />
            </View>
            <Text style={[styles.builder, { color: colors.mutedForeground }]} numberOfLines={1}>
              by {p.builderIds.map(builderName).join(", ")}
            </Text>
          </View>
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {p.description}
        </Text>
        <View style={styles.techRow}>
          {p.techStack.slice(0, 4).map((t) => (
            <SkillChip key={t} label={t} />
          ))}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader title="Projects" subtitle="Real work, shipped and documented" />
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search projects, tech stack" />
            <View style={styles.filters}>
              {(["all", "Launched", "Building", "Idea"] as FilterKey[]).map((f) => (
                <FilterChip
                  key={f}
                  label={f === "all" ? "All" : f}
                  active={filter === f}
                  onPress={() => setFilter(f)}
                />
              ))}
            </View>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {filtered.length} project{filtered.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="layers" title="No projects found" message="Try adjusting your search or filters." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 16, flex: 1 },
  builder: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3 },
  desc: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19, marginTop: 12 },
  techRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  count: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 14 },
});
