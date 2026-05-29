import { Feather } from "@expo/vector-icons";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  EmptyState,
  OutlineButton,
  Pill,
  SectionTitle,
  SkillChip,
} from "@/components/ui";
import { getBuildersByIds, projects } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const statusColors: Record<string, { bg: string; fg: string }> = {
  Launched: { bg: "#dcfce7", fg: "#166534" },
  Building: { bg: "#dbeafe", fg: "#1e40af" },
  Idea: { bg: "#fef3c7", fg: "#92400e" },
  Verified: { bg: "#ede9fe", fg: "#5b21b6" },
};

export default function ProjectDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === String(slug));

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Project" />
        <EmptyState icon="layers" title="Project not found" message="This project may have been removed." />
      </View>
    );
  }

  const sc = statusColors[project.status] || { bg: colors.secondary, fg: colors.mutedForeground };
  const builders = getBuildersByIds(project.builderIds);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title={project.name} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: colors.accent }]}>
          <Feather name="layers" size={32} color={colors.primary} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 18 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>{project.name}</Text>
          <Pill label={project.status} bg={sc.bg} fg={sc.fg} />
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>{project.description}</Text>

        <View style={styles.linksRow}>
          {project.link ? (
            <OutlineButton label="Live" icon="external-link" onPress={() => Linking.openURL(project.link!)} style={{ flex: 1 }} />
          ) : null}
          {project.repoUrl ? (
            <OutlineButton label="Code" icon="github" onPress={() => Linking.openURL(project.repoUrl!)} style={{ flex: 1 }} />
          ) : null}
        </View>

        <View style={styles.block}>
          <SectionTitle title="Tech stack" />
          <View style={styles.tagsWrap}>
            {project.techStack.map((t) => (
              <SkillChip key={t} label={t} />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <SectionTitle title="Contribution" />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{project.contribution}</Text>
        </View>

        {project.screenshots?.length ? (
          <View style={styles.block}>
            <SectionTitle title="Screenshots" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {project.screenshots.map((s, i) => (
                <Image
                  key={i}
                  source={{ uri: s.url }}
                  style={[styles.screenshot, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.block}>
          <SectionTitle title={builders.length > 1 ? "Builders" : "Builder"} />
          <View style={{ gap: 10 }}>
            {builders.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => router.push(`/builder/${b.username}` as Href)}
                style={({ pressed }) => [
                  styles.builderRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
                testID={`project-builder-${b.username}`}
              >
                <Avatar name={b.name} size={44} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.builderName, { color: colors.foreground }]}>{b.name}</Text>
                    {b.verificationStatus === "Verified" ? (
                      <Feather name="check-circle" size={13} color={colors.primary} />
                    ) : null}
                  </View>
                  <Text style={[styles.builderRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {b.role}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 120, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  name: { fontFamily: "Inter_700Bold", fontSize: 23, letterSpacing: -0.4, flex: 1 },
  desc: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginTop: 12 },
  linksRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  block: { marginTop: 28 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  body: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 22 },
  screenshot: { width: 260, height: 160, borderRadius: 14, borderWidth: 1 },
  builderRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  builderName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  builderRole: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
});
