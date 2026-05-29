import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  GradientButton,
  SkillChip,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";

export default function RequestScreen() {
  const colors = useColors();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [roleNeeded, setRoleNeeded] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [email, setEmail] = useState("");
  const [remote, setRemote] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const addSkill = () => {
    const s = skillsInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillsInput("");
    }
  };

  const canSubmit = companyName && roleNeeded && email && skills.length > 0;

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Request submitted" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}>
          <View style={styles.successWrap}>
            <LinearGradient
              colors={[colors.gradientFrom, colors.gradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successIcon}
            >
              <Feather name="check" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>You&apos;re all set</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              We&apos;ve received your request for a {roleNeeded}. Our team will match you with trusted
              builders and reach out at {email}.
            </Text>
            <GradientButton
              label="Back to home"
              icon="home"
              onPress={() => router.replace("/(tabs)" as any)}
              style={{ marginTop: 28, alignSelf: "stretch" }}
              testID="request-done"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Hire a builder" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Tell us what you need. We&apos;ll match you with verified builders from the community.
        </Text>

        <Field label="Company name" required>
          <Input value={companyName} onChangeText={setCompanyName} placeholder="Acme Inc." />
        </Field>

        <Field label="Role needed" required>
          <Input value={roleNeeded} onChangeText={setRoleNeeded} placeholder="Full-stack Engineer" />
        </Field>

        <Field label="Skills required" required>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                value={skillsInput}
                onChangeText={setSkillsInput}
                placeholder="Add a skill"
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
            </View>
            <Pressable
              onPress={addSkill}
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
              testID="add-skill"
            >
              <Feather name="plus" size={20} color={colors.primaryForeground} />
            </Pressable>
          </View>
          {skills.length > 0 ? (
            <View style={styles.skillsWrap}>
              {skills.map((s) => (
                <Pressable key={s} onPress={() => setSkills(skills.filter((x) => x !== s))}>
                  <View style={[styles.skillTag, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.skillTagText, { color: colors.secondaryForeground }]}>{s}</Text>
                    <Feather name="x" size={13} color={colors.mutedForeground} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Field>

        <Field label="Budget range">
          <Input value={budget} onChangeText={setBudget} placeholder="$3,000 - $5,000 / mo" />
        </Field>

        <Field label="Timeline">
          <Input value={timeline} onChangeText={setTimeline} placeholder="ASAP, 3 months" />
        </Field>

        <Field label="Contact email" required>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>

        <View style={[styles.remoteRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.remoteLabel, { color: colors.foreground }]}>Remote OK</Text>
            <Text style={[styles.remoteHint, { color: colors.mutedForeground }]}>
              Open to fully-remote builders
            </Text>
          </View>
          <Switch
            value={remote}
            onValueChange={setRemote}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>

        <GradientButton
          label="Submit request"
          icon="send"
          onPress={() => setSubmitted(true)}
          disabled={!canSubmit}
          style={{ marginTop: 28 }}
          testID="submit-request"
        />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
        {required ? <Text style={{ color: colors.destructive }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      {...props}
      style={[
        styles.input,
        { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 21, marginTop: 4 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  addBtn: { width: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  skillTagText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  remoteRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  remoteLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  remoteHint: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  successWrap: { alignItems: "center", paddingVertical: 40 },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  successTitle: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 24 },
  successSub: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", marginTop: 10, lineHeight: 22, paddingHorizontal: 8 },
});
