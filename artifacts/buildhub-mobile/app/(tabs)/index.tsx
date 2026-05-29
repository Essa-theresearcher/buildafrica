import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  SectionTitle,
  SkillChip,
  Tag,
  useTopInset,
} from "@/components/ui";
import { builders, projects } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const statusColors: Record<string, { bg: string; fg: string }> = {
  Verified: { bg: "#ede9fe", fg: "#5b21b6" },
  Launched: { bg: "#dcfce7", fg: "#166534" },
  Building: { bg: "#dbeafe", fg: "#1e40af" },
  Idea: { bg: "#fef3c7", fg: "#92400e" },
};

export default function HomeScreen() {
  const colors = useColors();
  const topInset = useTopInset();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const featuredProjects = projects.filter((p) => p.featured);
  const featuredBuilders = builders.filter((b) => b.verificationStatus === "Verified").slice(0, 4);

  const stats = [
    { label: "Verified builders", value: builders.filter((b) => b.verificationStatus === "Verified").length, icon: "check-circle" },
    { label: "Shipped projects", value: projects.length, icon: "package" },
    { label: "Open requests", value: 3, icon: "briefcase" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: CONTENT_BOTTOM_PAD }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topInset + 18 }]}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Feather name="box" size={20} color="#fff" />
          </View>
          <Text style={styles.brandName}>BuildHub</Text>
          {isSignedIn ? (
            <Pressable
              onPress={() => router.push("/(tabs)/account" as Href)}
              style={styles.portalBtn}
              hitSlop={8}
            >
              <Feather name="grid" size={18} color="#fff" />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.heroTitle}>Proof of work,{"\n"}not self-promotion</Text>
        <Text style={styles.heroSubtitle}>
          Discover trusted builders who prove execution through shipped projects and verified
          profiles.
        </Text>

        <View style={styles.heroCtas}>
          <Pressable
            onPress={() => router.push("/(tabs)/builders" as Href)}
            style={({ pressed }) => [styles.heroPrimary, pressed && { opacity: 0.85 }]}
            testID="cta-builders"
          >
            <Text style={[styles.heroPrimaryText, { color: colors.primary }]}>Explore builders</Text>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/request" as Href)}
            style={({ pressed }) => [styles.heroSecondary, pressed && { opacity: 0.7 }]}
            testID="cta-hire"
          >
            <Text style={styles.heroSecondaryText}>Hire a builder</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={s.icon as any} size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Featured projects"
          action={
            <Pressable onPress={() => router.push("/(tabs)/projects" as Href)} hitSlop={8}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingRight: 4 }}
        >
          {featuredProjects.map((p) => {
            const sc = statusColors[p.status] || { bg: colors.secondary, fg: colors.mutedForeground };
            return (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/project/${p.slug}` as Href)}
                style={({ pressed }) => [
                  styles.projectCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.85 },
                ]}
                testID={`home-project-${p.slug}`}
              >
                <View style={[styles.projectIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="layers" size={20} color={colors.primary} />
                </View>
                <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusPillText, { color: sc.fg }]}>{p.status}</Text>
                </View>
                <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[styles.projectDesc, { color: colors.mutedForeground }]} numberOfLines={3}>
                  {p.description}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Top verified builders"
          action={
            <Pressable onPress={() => router.push("/(tabs)/builders" as Href)} hitSlop={8}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          }
        />
        <View style={{ gap: 12 }}>
          {featuredBuilders.map((b) => (
            <Card key={b.id} onPress={() => router.push(`/builder/${b.username}` as Href)} testID={`home-builder-${b.username}`}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar name={b.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.builderName, { color: colors.foreground }]}>{b.name}</Text>
                  <Text style={[styles.builderRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {b.role} · {b.location}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
              </View>
              <View style={styles.skillsRow}>
                {b.skills.slice(0, 3).map((s) => (
                  <SkillChip key={s} label={s} />
                ))}
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={[styles.section, { paddingBottom: 8 }]}>
        <SectionTitle title="Reputation signals" />
        <View style={styles.tagsWrap}>
          {(["Verified Builder", "Shipped Project", "Reliable Collaborator", "Available for Work", "Coffee & Code Member"] as const).map(
            (t) => (
              <Tag key={t} tag={t} />
            ),
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 19, flex: 1 },
  portalBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  heroSubtitle: { color: "rgba(255,255,255,0.92)", fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 21, marginTop: 12 },
  heroCtas: { flexDirection: "row", gap: 12, marginTop: 22 },
  heroPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  heroPrimaryText: { fontFamily: "Inter_600SemiBold", fontSize: 14.5 },
  heroSecondary: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  heroSecondaryText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14.5 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 18 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14, gap: 6 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 15 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  seeAll: { fontFamily: "Inter_600SemiBold", fontSize: 13.5 },
  projectCard: { width: 230, borderWidth: 1, borderRadius: 18, padding: 16 },
  projectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statusPill: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  statusPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  projectName: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 },
  projectDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  builderName: { fontFamily: "Inter_600SemiBold", fontSize: 15.5 },
  builderRole: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
