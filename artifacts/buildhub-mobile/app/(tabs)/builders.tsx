import { Feather } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  EmptyState,
  FilterChip,
  GradientHeader,
  Pill,
  SearchBar,
  SkillChip,
} from "@/components/ui";
import { builders } from "@/data/seed";
import { useColors } from "@/hooks/useColors";
import type { Builder } from "@/types";

type FilterKey = "all" | "available" | "verified";

const availabilityColor: Record<string, { bg: string; fg: string }> = {
  Available: { bg: "#d1fae5", fg: "#065f46" },
  Limited: { bg: "#fef3c7", fg: "#92400e" },
  Unavailable: { bg: "#fee2e2", fg: "#991b1b" },
};

export default function BuildersScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return builders.filter((b) => {
      if (filter === "available" && b.availability !== "Available") return false;
      if (filter === "verified" && b.verificationStatus !== "Verified") return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.role.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  const renderItem = ({ item: b }: { item: Builder }) => {
    const ac = availabilityColor[b.availability];
    return (
      <Card onPress={() => router.push(`/builder/${b.username}` as Href)} testID={`builder-${b.username}`} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={b.name} size={52} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {b.name}
              </Text>
              {b.verificationStatus === "Verified" ? (
                <Feather name="check-circle" size={14} color={colors.primary} />
              ) : null}
            </View>
            <Text style={[styles.role, { color: colors.mutedForeground }]} numberOfLines={1}>
              {b.role}
            </Text>
            <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
              <Feather name="map-pin" size={11} color={colors.mutedForeground} /> {b.location}
            </Text>
          </View>
          <Pill label={b.availability} bg={ac.bg} fg={ac.fg} />
        </View>
        <View style={styles.skillsRow}>
          {b.skills.slice(0, 4).map((s) => (
            <SkillChip key={s} label={s} />
          ))}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader title="Builders" subtitle="Trusted builders who ship and deliver" />
      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search builders, skills, location" />
            <View style={styles.filters}>
              <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
              <FilterChip label="Available" active={filter === "available"} onPress={() => setFilter("available")} />
              <FilterChip label="Verified" active={filter === "verified"} onPress={() => setFilter("verified")} />
            </View>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {filtered.length} builder{filtered.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="users" title="No builders found" message="Try adjusting your search or filters." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  role: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  location: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  filters: { flexDirection: "row", gap: 8, marginTop: 14 },
  count: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 14 },
});
