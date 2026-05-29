import { Feather } from "@expo/vector-icons";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Avatar,
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  EmptyState,
  GradientButton,
  Pill,
  SectionTitle,
  SkillChip,
  Tag,
} from "@/components/ui";
import { getBuilderByUsername, getBuildersByIds, getProjectsByBuilderIds } from "@/data/seed";
import { useColors } from "@/hooks/useColors";

const availabilityColor: Record<string, { bg: string; fg: string }> = {
  Available: { bg: "#d1fae5", fg: "#065f46" },
  Limited: { bg: "#fef3c7", fg: "#92400e" },
  Unavailable: { bg: "#fee2e2", fg: "#991b1b" },
};

const statusColors: Record<string, { bg: string; fg: string }> = {
  Launched: { bg: "#dcfce7", fg: "#166534" },
  Building: { bg: "#dbeafe", fg: "#1e40af" },
  Idea: { bg: "#fef3c7", fg: "#92400e" },
  Verified: { bg: "#ede9fe", fg: "#5b21b6" },
};

export default function BuilderProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const builder = getBuilderByUsername(String(username));

  if (!builder) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Builder" />
        <EmptyState icon="user-x" title="Builder not found" message="This profile may have been removed." />
      </View>
    );
  }

  const ac = availabilityColor[builder.availability];
  const projects = getProjectsByBuilderIds([builder.id]);
  const collaborators = getBuildersByIds(builder.collaborators);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title={builder.name} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileTop}>
          <Avatar name={builder.name} size={84} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>{builder.name}</Text>
            {builder.verificationStatus === "Verified" ? (
              <Feather name="check-circle" size={20} color={colors.primary} />
            ) : null}
          </View>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>{builder.role}</Text>
          <Text style={[styles.location, { color: colors.mutedForeground }]}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} /> {builder.location}
          </Text>
          <View style={{ marginTop: 12 }}>
            <Pill label={builder.availability} bg={ac.bg} fg={ac.fg} icon="circle" />
          </View>
        </View>

        <GradientButton
          label="Get in touch"
          icon="mail"
          onPress={() => Linking.openURL(`mailto:${builder.contact}`)}
          style={{ marginTop: 20 }}
          testID="contact-builder"
        />

        {builder.tags?.length ? (
          <View style={[styles.block]}>
            <View style={styles.tagsWrap}>
              {builder.tags.map((t) => (
                <Tag key={t} tag={t} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <SectionTitle title="About" />
          <Text style={[styles.bio, { color: colors.mutedForeground }]}>{builder.bio}</Text>
        </View>

        <View style={styles.block}>
          <SectionTitle title="Skills" />
          <View style={styles.tagsWrap}>
            {builder.skills.map((s) => (
              <SkillChip key={s} label={s} />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <SectionTitle title={`Projects (${projects.length})`} />
          {projects.length === 0 ? (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>No projects yet.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {projects.map((p) => {
                const sc = statusColors[p.status] || { bg: colors.secondary, fg: colors.mutedForeground };
                return (
                  <Card key={p.id} onPress={() => router.push(`/project/${p.slug}` as Href)} testID={`builder-project-${p.slug}`}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Pill label={p.status} bg={sc.bg} fg={sc.fg} />
                    </View>
                    <Text style={[styles.projectDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {p.description}
                    </Text>
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {builder.endorsements?.length ? (
          <View style={styles.block}>
            <SectionTitle title="Endorsements" />
            <View style={{ gap: 12 }}>
              {builder.endorsements.map((e, i) => {
                const from = getBuildersByIds([e.fromId])[0];
                return (
                  <Card key={i}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <Avatar name={from?.name ?? "?"} size={32} />
                      <Text style={[styles.endorseFrom, { color: colors.foreground }]}>
                        {from?.name ?? "Anonymous"}
                      </Text>
                    </View>
                    <Text style={[styles.endorseNote, { color: colors.mutedForeground }]}>
                      &ldquo;{e.note}&rdquo;
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>
        ) : null}

        {collaborators.length ? (
          <View style={styles.block}>
            <SectionTitle title="Collaborators" />
            <View style={{ gap: 10 }}>
              {collaborators.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/builder/${c.username}` as Href)}
                  style={({ pressed }) => [
                    styles.collabRow,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Avatar name={c.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.collabName, { color: colors.foreground }]}>{c.name}</Text>
                    <Text style={[styles.collabRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {c.role}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileTop: { alignItems: "center" },
  name: { fontFamily: "Inter_700Bold", fontSize: 24, letterSpacing: -0.4 },
  role: { fontFamily: "Inter_500Medium", fontSize: 15, marginTop: 4 },
  location: { fontFamily: "Inter_400Regular", fontSize: 13.5, marginTop: 5 },
  block: { marginTop: 28 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bio: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 22 },
  muted: { fontFamily: "Inter_400Regular", fontSize: 14 },
  projectName: { fontFamily: "Inter_600SemiBold", fontSize: 15.5, flex: 1 },
  projectDesc: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19, marginTop: 8 },
  endorseFrom: { fontFamily: "Inter_600SemiBold", fontSize: 14.5 },
  endorseNote: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, fontStyle: "italic" },
  collabRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  collabName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  collabRole: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
});
