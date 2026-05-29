import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  EmptyState,
  ErrorState,
  FilterChip,
  GradientButton,
  OutlineButton,
  Pill,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { apiFetch } from "@/lib/api";

interface Application {
  id: string;
  builder_clerk_id: string;
  status: string;
  primary_skill: string;
  challenge_title?: string;
  challenge_skill?: string;
  submission_github_url?: string;
  submission_demo_url?: string;
  submission_explanation?: string;
  submitted_at?: string;
  call_scheduled_at?: string;
  challenge_deadline?: string;
  admin_notes?: string;
  created_at: string;
}

interface Challenge {
  id: string;
  title: string;
  skill_category: string;
  requirements: string[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "challenge_assigned", label: "Assigned" },
  { value: "submitted", label: "Needs Call" },
  { value: "call_scheduled", label: "Scheduled" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

const STATUS_PALETTE: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#fef3c7", fg: "#92400e" },
  challenge_assigned: { bg: "#dbeafe", fg: "#1e40af" },
  submitted: { bg: "#ede9fe", fg: "#5b21b6" },
  call_scheduled: { bg: "#ede9fe", fg: "#5b21b6" },
  passed: { bg: "#dcfce7", fg: "#166534" },
  conditional_pass: { bg: "#dcfce7", fg: "#166534" },
  failed: { bg: "#fee2e2", fg: "#991b1b" },
};

export default function AdminVerificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const isAdmin = useIsAdmin();

  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModal, setAssignModal] = useState<Application | null>(null);
  const [scheduleModal, setScheduleModal] = useState<Application | null>(null);
  const [decideModal, setDecideModal] = useState<Application | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { applications } = await apiFetch<{ applications: Application[] }>(
        `/api/verify/admin/all?status=${filter}`,
      );
      setApps(applications || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isLoaded && isAdmin) load();
  }, [isLoaded, isAdmin, load]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Verifications" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Verifications" />
        <View style={styles.center}>
          <Feather name="lock" size={32} color={colors.mutedForeground} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Sign in required</Text>
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
        <DetailHeader title="Verifications" />
        <View style={styles.center}>
          <Feather name="shield-off" size={32} color={colors.destructive} />
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Admins only</Text>
          <OutlineButton
            label="Go to dashboard"
            onPress={() => router.replace("/dashboard" as Href)}
            style={{ marginTop: 20, alignSelf: "stretch" }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Verifications" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filtersRow}>
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              active={filter === f.value}
              onPress={() => setFilter(f.value)}
            />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : apps.length === 0 ? (
          <EmptyState icon="inbox" title="No applications" message="Nothing in this category yet." />
        ) : (
          <View style={{ gap: 12, marginTop: 8 }}>
            {apps.map((app) => {
              const palette = STATUS_PALETTE[app.status] || { bg: colors.secondary, fg: colors.mutedForeground };
              return (
                <Card key={app.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <Pill label={app.status.replace(/_/g, " ")} bg={palette.bg} fg={palette.fg} />
                    <Text style={[styles.appMeta, { color: colors.mutedForeground }]}>
                      {app.primary_skill}
                    </Text>
                    <Text style={[styles.appMeta, { color: colors.mutedForeground }]}>
                      · {new Date(app.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={[styles.appBuilder, { color: colors.foreground }]} numberOfLines={1}>
                    {app.builder_clerk_id}
                  </Text>

                  {app.challenge_title ? (
                    <Text style={[styles.appMeta, { color: colors.mutedForeground, marginTop: 6 }]}>
                      Challenge: <Text style={{ color: colors.foreground }}>{app.challenge_title}</Text>
                    </Text>
                  ) : null}

                  {app.challenge_deadline && app.status === "challenge_assigned" ? (
                    <Text style={[styles.appDeadline, { color: colors.warning }]}>
                      Deadline: {new Date(app.challenge_deadline).toLocaleString()}
                    </Text>
                  ) : null}

                  {app.submission_github_url ? (
                    <View style={{ marginTop: 8, gap: 4 }}>
                      <Text style={[styles.appMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        GitHub: <Text style={{ color: colors.primary }}>{app.submission_github_url}</Text>
                      </Text>
                      {app.submission_demo_url ? (
                        <Text style={[styles.appMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                          Demo: <Text style={{ color: colors.primary }}>{app.submission_demo_url}</Text>
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    {app.status === "pending" ? (
                      <GradientButton
                        label="Assign Challenge"
                        icon="zap"
                        onPress={() => setAssignModal(app)}
                        style={{ flexGrow: 1 }}
                      />
                    ) : null}
                    {app.status === "submitted" ? (
                      <OutlineButton
                        label="Schedule Call"
                        icon="phone"
                        onPress={() => setScheduleModal(app)}
                        style={{ flexGrow: 1 }}
                      />
                    ) : null}
                    {(app.status === "call_scheduled" || app.status === "submitted") ? (
                      <GradientButton
                        label="Record Decision"
                        icon="check-circle"
                        onPress={() => setDecideModal(app)}
                        style={{ flexGrow: 1 }}
                      />
                    ) : null}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {assignModal ? (
        <AssignChallengeModal
          app={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={() => {
            setAssignModal(null);
            load();
          }}
        />
      ) : null}

      {scheduleModal ? (
        <ScheduleCallModal
          app={scheduleModal}
          onClose={() => setScheduleModal(null)}
          onScheduled={() => {
            setScheduleModal(null);
            load();
          }}
        />
      ) : null}

      {decideModal ? (
        <DecideModal
          app={decideModal}
          onClose={() => setDecideModal(null)}
          onDecided={() => {
            setDecideModal(null);
            load();
          }}
        />
      ) : null}
    </View>
  );
}

function AssignChallengeModal({
  app,
  onClose,
  onAssigned,
}: {
  app: Application;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const colors = useColors();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ challenges: Challenge[] }>(`/api/verify/challenges?skill=${app.primary_skill}`)
      .then((d) => setChallenges(d.challenges || []))
      .catch((e: any) => setError(e?.message || "Failed to load challenges"));
  }, [app.primary_skill]);

  const submit = async () => {
    if (!selected) {
      setError("Select a challenge first");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/verify/admin/assign-challenge", {
        method: "POST",
        body: JSON.stringify({ application_id: app.id, challenge_id: selected }),
      });
      onAssigned();
    } catch (e: any) {
      setError(e?.message || "Failed to assign challenge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Assign Challenge" onClose={onClose}>
      <Text style={[modalStyles.note, { color: colors.mutedForeground }]}>
        Skill: <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{app.primary_skill}</Text>
      </Text>

      {challenges.length === 0 && !error ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
      ) : (
        <View style={{ gap: 10, marginTop: 14 }}>
          {challenges.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setSelected(c.id)}
              style={({ pressed }) => [
                modalStyles.challengeCard,
                {
                  backgroundColor: selected === c.id ? colors.accent : colors.card,
                  borderColor: selected === c.id ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[modalStyles.challengeTitle, { color: colors.foreground }]}>{c.title}</Text>
              {(c.requirements || []).slice(0, 3).map((r, i) => (
                <Text key={i} style={[modalStyles.challengeReq, { color: colors.mutedForeground }]}>
                  · {r}
                </Text>
              ))}
            </Pressable>
          ))}
        </View>
      )}

      {error ? <Text style={[modalStyles.error, { color: colors.destructive }]}>{error}</Text> : null}

      <GradientButton
        label="Assign Challenge"
        icon="check"
        onPress={submit}
        loading={submitting}
        disabled={!selected}
        style={{ marginTop: 20 }}
      />
    </ModalShell>
  );
}

function ScheduleCallModal({
  app,
  onClose,
  onScheduled,
}: {
  app: Application;
  onClose: () => void;
  onScheduled: () => void;
}) {
  const colors = useColors();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!value) {
      setError("Enter a call date/time");
      return;
    }
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      setError("Invalid date. Use ISO format like 2024-12-01T14:00:00");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/verify/admin/schedule-call", {
        method: "POST",
        body: JSON.stringify({ application_id: app.id, call_scheduled_at: parsed.toISOString() }),
      });
      onScheduled();
    } catch (e: any) {
      setError(e?.message || "Failed to schedule call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Schedule Call" onClose={onClose}>
      <Text style={[modalStyles.note, { color: colors.mutedForeground }]}>
        Enter the scheduled call date/time in ISO format.
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="2024-12-01T14:00:00"
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="none"
        style={[
          modalStyles.input,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
        ]}
      />
      {error ? <Text style={[modalStyles.error, { color: colors.destructive }]}>{error}</Text> : null}
      <GradientButton
        label="Schedule"
        icon="phone"
        onPress={submit}
        loading={submitting}
        style={{ marginTop: 20 }}
      />
    </ModalShell>
  );
}

function DecideModal({
  app,
  onClose,
  onDecided,
}: {
  app: Application;
  onClose: () => void;
  onDecided: () => void;
}) {
  const colors = useColors();
  const [decision, setDecision] = useState<"passed" | "conditional_pass" | "failed">("passed");
  const [notes, setNotes] = useState("");
  const [badgeScope, setBadgeScope] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    can_demo_without_hesitation: false,
    can_explain_approach: false,
    answered_unexpected_questions: false,
    made_live_change: false,
    commit_history_real: false,
    has_other_projects: false,
    knows_community: false,
    gut_feeling_pass: false,
  });

  const checklistItems: { key: keyof typeof checklist; label: string }[] = [
    { key: "can_demo_without_hesitation", label: "Can demo without hesitation" },
    { key: "can_explain_approach", label: "Can explain their approach" },
    { key: "answered_unexpected_questions", label: "Answered unexpected questions" },
    { key: "made_live_change", label: "Made a live change on call" },
    { key: "commit_history_real", label: "Commit history looks real" },
    { key: "has_other_projects", label: "Has other shipped projects" },
    { key: "knows_community", label: "Knows the community" },
    { key: "gut_feeling_pass", label: "Gut feeling: pass" },
  ];

  const checkCount = Object.values(checklist).filter(Boolean).length;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/verify/admin/decide", {
        method: "POST",
        body: JSON.stringify({
          application_id: app.id,
          decision,
          admin_notes: notes,
          badge_scope: badgeScope || undefined,
          checklist,
        }),
      });
      onDecided();
    } catch (e: any) {
      setError(e?.message || "Failed to record decision");
    } finally {
      setSubmitting(false);
    }
  };

  const decisionOptions: { value: typeof decision; label: string }[] = [
    { value: "passed", label: "Pass" },
    { value: "conditional_pass", label: "Conditional" },
    { value: "failed", label: "Fail" },
  ];

  return (
    <ModalShell title="Record Decision" onClose={onClose}>
      <View style={[modalStyles.checklistBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={[modalStyles.checklistTitle, { color: colors.mutedForeground }]}>Call Checklist</Text>
          <Text style={[modalStyles.checklistCount, { color: checkCount >= 6 ? colors.success : colors.mutedForeground }]}>
            {checkCount}/8
          </Text>
        </View>
        {checklistItems.map(({ key, label }) => (
          <View key={key} style={modalStyles.checklistRow}>
            <Switch
              value={checklist[key]}
              onValueChange={(v) => setChecklist((c) => ({ ...c, [key]: v }))}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
            <Text style={[modalStyles.checklistLabel, { color: checklist[key] ? colors.foreground : colors.mutedForeground }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[modalStyles.fieldLabel, { color: colors.foreground }]}>Decision</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {decisionOptions.map((d) => (
          <Pressable
            key={d.value}
            onPress={() => setDecision(d.value)}
            style={({ pressed }) => [
              modalStyles.decisionBtn,
              {
                backgroundColor: decision === d.value ? colors.primary : colors.card,
                borderColor: decision === d.value ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                modalStyles.decisionBtnText,
                { color: decision === d.value ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {d.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {(decision === "passed" || decision === "conditional_pass") ? (
        <>
          <Text style={[modalStyles.fieldLabel, { color: colors.foreground, marginTop: 16 }]}>
            Badge Scope (optional)
          </Text>
          <TextInput
            value={badgeScope}
            onChangeText={setBadgeScope}
            placeholder="e.g. frontend only, React specialist"
            placeholderTextColor={colors.mutedForeground}
            style={[
              modalStyles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
          />
        </>
      ) : null}

      <Text style={[modalStyles.fieldLabel, { color: colors.foreground, marginTop: 16 }]}>
        Admin Notes
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Feedback for the builder…"
        placeholderTextColor={colors.mutedForeground}
        multiline
        style={[
          modalStyles.input,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, minHeight: 90, textAlignVertical: "top" },
        ]}
      />

      {error ? <Text style={[modalStyles.error, { color: colors.destructive }]}>{error}</Text> : null}

      <GradientButton
        label={`Record: ${decision.replace(/_/g, " ")}`}
        icon="check-circle"
        onPress={submit}
        loading={submitting}
        style={{ marginTop: 20 }}
      />
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { backgroundColor: colors.background }]}>
          <View style={[modalStyles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[modalStyles.sheetTitle, { color: colors.foreground }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 14 },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  appBuilder: { fontFamily: "Inter_600SemiBold", fontSize: 13.5 },
  appMeta: { fontFamily: "Inter_400Regular", fontSize: 12.5 },
  appDeadline: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 6 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { maxHeight: "92%", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  note: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19 },
  challengeCard: { padding: 14, borderRadius: 14, borderWidth: 1.5 },
  challengeTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14.5, marginBottom: 6 },
  challengeReq: { fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14.5,
    marginTop: 6,
  },
  error: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 12 },
  checklistBox: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 18 },
  checklistTitle: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" },
  checklistCount: { fontFamily: "Inter_700Bold", fontSize: 13 },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checklistLabel: { fontFamily: "Inter_400Regular", fontSize: 13.5, flex: 1 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 8, marginTop: 4 },
  decisionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  decisionBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13.5 },
});
