import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Card,
  CONTENT_BOTTOM_PAD,
  DetailHeader,
  ErrorState,
  GradientButton,
  OutlineButton,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  status: string;
  primary_skill: string;
  challenge_title?: string;
  challenge_description?: string;
  challenge_requirements?: string[];
  challenge_local_context?: string;
  challenge_time_limit_hours?: number;
  challenge_deadline?: string;
  submission_github_url?: string;
  submission_demo_url?: string;
  submission_explanation?: string;
  submitted_at?: string;
  call_scheduled_at?: string;
  admin_notes?: string;
  created_at: string;
};

const STEPS = [
  { key: "pending", label: "Applied" },
  { key: "challenge_assigned", label: "Challenge" },
  { key: "submitted", label: "Submitted" },
  { key: "call_scheduled", label: "Call" },
  { key: "passed", label: "Decision" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  challenge_assigned: 1,
  submitted: 2,
  call_scheduled: 3,
  passed: 4,
  failed: 4,
  conditional_pass: 4,
};

function Countdown({ deadline }: { deadline: string }) {
  const colors = useColors();
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Deadline passed");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s remaining`);
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  const isPast = new Date(deadline).getTime() < Date.now();
  const fg = isPast ? colors.destructive : colors.warning;
  return (
    <View
      style={[
        styles.countdownPill,
        { backgroundColor: colors.secondary, borderColor: fg },
      ]}
    >
      <Feather name="clock" size={12} color={fg} />
      <Text style={[styles.countdownText, { color: fg }]}>{remaining}</Text>
    </View>
  );
}

function SubmissionForm({ onSubmitted }: { onSubmitted: () => void }) {
  const colors = useColors();
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [explanation, setExplanation] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const charCount = explanation.length;
  const charOk = charCount >= 150 && charCount <= 500;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!github.startsWith("https://github.com/"))
      e.github = "Must start with https://github.com/";
    if (!demo.startsWith("https://")) e.demo = "Must start with https://";
    if (explanation.length < 150)
      e.explanation = `Too short — ${explanation.length}/150 characters minimum`;
    else if (explanation.length > 500)
      e.explanation = `Too long — ${explanation.length}/500 characters maximum`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/verify/submit", {
        method: "POST",
        body: JSON.stringify({
          github_url: github,
          demo_url: demo,
          explanation,
          screenshot_url: screenshot || undefined,
        }),
      });
      onSubmitted();
    } catch (err: any) {
      setErrors({ _: err?.message || "Failed to submit." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View>
      <Field label="GitHub Repository URL" required>
        <Input
          value={github}
          onChangeText={setGithub}
          placeholder="https://github.com/yourname/project"
          autoCapitalize="none"
          keyboardType="url"
          error={!!errors.github}
        />
        {errors.github ? (
          <Text style={[styles.fieldError, { color: colors.destructive }]}>{errors.github}</Text>
        ) : null}
      </Field>

      <Field label="Live Demo URL" required>
        <Input
          value={demo}
          onChangeText={setDemo}
          placeholder="https://your-demo.vercel.app"
          autoCapitalize="none"
          keyboardType="url"
          error={!!errors.demo}
        />
        {errors.demo ? (
          <Text style={[styles.fieldError, { color: colors.destructive }]}>{errors.demo}</Text>
        ) : null}
      </Field>

      <Field
        label="What did you build, what was the hardest problem you solved, and what would you change with more time?"
        required
      >
        <Input
          value={explanation}
          onChangeText={setExplanation}
          placeholder="Tell us about your build…"
          multiline
          numberOfLines={6}
          style={{ minHeight: 130, textAlignVertical: "top" }}
          error={!!errors.explanation}
        />
        <View style={styles.charRow}>
          {errors.explanation ? (
            <Text style={[styles.fieldError, { color: colors.destructive }]}>
              {errors.explanation}
            </Text>
          ) : (
            <Text style={{ flex: 1 }} />
          )}
          <Text
            style={[
              styles.charCount,
              { color: charOk ? colors.success : colors.destructive },
            ]}
          >
            {charCount}/500
          </Text>
        </View>
      </Field>

      <Field label="Screenshot URL (optional)">
        <Input
          value={screenshot}
          onChangeText={setScreenshot}
          placeholder="https://…/screenshot.png"
          autoCapitalize="none"
          keyboardType="url"
        />
      </Field>

      {errors._ ? (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: colors.secondary, borderColor: colors.destructive },
          ]}
        >
          <Feather name="alert-circle" size={14} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{errors._}</Text>
        </View>
      ) : null}

      <GradientButton
        label="Submit My Work"
        icon="send"
        onPress={submit}
        loading={submitting}
        style={{ marginTop: 22 }}
        testID="verify-submit-work"
      />
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
    <View style={{ marginTop: 18 }}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
        {required ? <Text style={{ color: colors.destructive }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { error?: boolean },
) {
  const colors = useColors();
  const { error, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      {...rest}
      style={[
        styles.input,
        {
          borderColor: error ? colors.destructive : colors.border,
          color: colors.foreground,
          backgroundColor: colors.card,
        },
        style,
      ]}
    />
  );
}

export default function VerifyStatusScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const [app, setApp] = useState<Application | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const data = await apiFetch<{ application: Application | null }>("/api/verify/status");
      setApp(data.application);
    } catch (err: any) {
      setError(err?.message || "Failed to load");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) load();
    else if (isLoaded) setFetching(false);
  }, [isLoaded, isSignedIn, load]);

  if (!isLoaded || fetching) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Verification Status" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Verification Status" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}>
          <Card style={{ alignItems: "center", paddingVertical: 32, marginTop: 40 }}>
            <Text style={[styles.signInTitle, { color: colors.foreground }]}>
              Sign in to view your status
            </Text>
            <GradientButton
              label="Sign in"
              icon="log-in"
              onPress={() => router.push("/(auth)/sign-in" as Href)}
              style={{ marginTop: 16, alignSelf: "stretch" }}
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Verification Status" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}>
          <ErrorState message={error} onRetry={load} />
        </ScrollView>
      </View>
    );
  }

  if (!app) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Verification Status" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}>
          <Card style={{ alignItems: "center", paddingVertical: 32, marginTop: 40 }}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
              <Feather name="shield" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No active application
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              You haven&apos;t started the verification process yet.
            </Text>
            <GradientButton
              label="Apply for Verification"
              icon="arrow-right"
              onPress={() => router.replace("/verify" as Href)}
              style={{ marginTop: 20, alignSelf: "stretch" }}
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  const currentStep = STATUS_ORDER[app.status] ?? 0;
  const isFinal = ["passed", "failed", "conditional_pass"].includes(app.status);
  const deadlinePassed = app.challenge_deadline
    ? new Date(app.challenge_deadline).getTime() < Date.now()
    : false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Verification Status" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Verification Status</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Application</Text>

        {/* Step tracker */}
        <Card style={{ marginTop: 18 }}>
          <View style={styles.stepperRow}>
            {STEPS.map((step, i) => {
              const done = i < currentStep || (isFinal && i === currentStep);
              const active = i === currentStep && !isFinal;
              const failed = app.status === "failed" && i === currentStep;
              const bg = failed
                ? colors.destructive
                : done
                  ? colors.success
                  : active
                    ? colors.primary
                    : colors.secondary;
              return (
                <React.Fragment key={step.key}>
                  <View style={styles.stepCell}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: bg,
                          borderColor: bg,
                        },
                      ]}
                    >
                      {done && !failed ? (
                        <Feather name="check" size={14} color="#fff" />
                      ) : failed ? (
                        <Feather name="x" size={14} color="#fff" />
                      ) : (
                        <Text
                          style={{
                            color: active ? "#fff" : colors.mutedForeground,
                            fontFamily: "Inter_700Bold",
                            fontSize: 11,
                          }}
                        >
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color:
                            active || done ? colors.foreground : colors.mutedForeground,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {i < STEPS.length - 1 ? (
                    <View
                      style={{
                        flex: 1,
                        height: 2,
                        marginTop: -18,
                        backgroundColor: i < currentStep ? colors.success : colors.border,
                      }}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>
        </Card>

        {/* PENDING */}
        {app.status === "pending" ? (
          <Card style={{ marginTop: 18, alignItems: "center" }}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
              <Feather name="clock" size={26} color={colors.warning} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Application received
            </Text>
            <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
              A BuildHub admin will review your application and assign you a coding challenge.
              This usually takes 1–2 business days.
            </Text>
            <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
              Skill:{" "}
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", textTransform: "capitalize" }}>
                {app.primary_skill}
              </Text>
            </Text>
          </Card>
        ) : null}

        {/* CHALLENGE ASSIGNED */}
        {app.status === "challenge_assigned" && app.challenge_title ? (
          <>
            <Card style={{ marginTop: 18 }}>
              <Text style={[styles.eyebrow, { color: colors.primary, marginBottom: 4 }]}>
                Your Challenge
              </Text>
              <Text style={[styles.cardHeading, { color: colors.foreground }]}>
                {app.challenge_title}
              </Text>
              {app.challenge_deadline ? (
                <View style={{ marginTop: 12, alignSelf: "flex-start" }}>
                  <Countdown deadline={app.challenge_deadline} />
                </View>
              ) : null}

              {app.challenge_local_context ? (
                <View
                  style={[
                    styles.contextBox,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.contextLabel, { color: colors.primary }]}>
                    CONTEXT
                  </Text>
                  <Text style={[styles.contextBody, { color: colors.foreground }]}>
                    {app.challenge_local_context}
                  </Text>
                </View>
              ) : null}

              {app.challenge_description ? (
                <Text style={[styles.cardBody, { color: colors.mutedForeground, marginTop: 14, textAlign: "left" }]}>
                  {app.challenge_description}
                </Text>
              ) : null}

              {Array.isArray(app.challenge_requirements) && app.challenge_requirements.length > 0 ? (
                <View style={{ marginTop: 18 }}>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Requirements
                  </Text>
                  {app.challenge_requirements.map((req, i) => (
                    <View key={i} style={styles.reqRow}>
                      <View style={[styles.reqBullet, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.reqBulletText, { color: colors.success }]}>
                          {i + 1}
                        </Text>
                      </View>
                      <Text style={[styles.reqText, { color: colors.mutedForeground }]}>
                        {req}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>

            {!deadlinePassed ? (
              <Card style={{ marginTop: 18 }}>
                <Text style={[styles.cardHeading, { color: colors.foreground }]}>
                  Submit Your Work
                </Text>
                <SubmissionForm onSubmitted={load} />
              </Card>
            ) : (
              <Card style={{ marginTop: 18, alignItems: "center" }}>
                <Feather name="x-circle" size={26} color={colors.destructive} />
                <Text
                  style={[
                    styles.cardBody,
                    { color: colors.destructive, fontFamily: "Inter_600SemiBold", marginTop: 10 },
                  ]}
                >
                  The submission deadline has passed.
                </Text>
              </Card>
            )}
          </>
        ) : null}

        {/* SUBMITTED */}
        {app.status === "submitted" ? (
          <Card style={{ marginTop: 18 }}>
            <View style={styles.headerRow}>
              <Feather name="check-circle" size={22} color={colors.success} />
              <Text style={[styles.cardHeading, { color: colors.foreground }]}>
                Work submitted
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: colors.mutedForeground, textAlign: "left", marginTop: 12 }]}>
              Waiting for a BuildHub admin to review your submission and schedule a live call.
            </Text>
            <View style={{ marginTop: 14, gap: 10 }}>
              {app.submission_github_url ? (
                <Pressable
                  onPress={() => Linking.openURL(app.submission_github_url!)}
                  style={styles.linkRow}
                >
                  <Feather name="external-link" size={14} color={colors.primary} />
                  <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>
                    {app.submission_github_url}
                  </Text>
                </Pressable>
              ) : null}
              {app.submission_demo_url ? (
                <Pressable
                  onPress={() => Linking.openURL(app.submission_demo_url!)}
                  style={styles.linkRow}
                >
                  <Feather name="external-link" size={14} color={colors.primary} />
                  <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>
                    {app.submission_demo_url}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
        ) : null}

        {/* CALL SCHEDULED */}
        {app.status === "call_scheduled" ? (
          <Card style={{ marginTop: 18 }}>
            <View style={styles.headerRow}>
              <Feather name="clock" size={22} color={colors.primary} />
              <Text style={[styles.cardHeading, { color: colors.foreground }]}>
                Call confirmed
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: colors.mutedForeground, textAlign: "left", marginTop: 10 }]}>
              Your call is confirmed. Be ready to demo your project live — share your screen, run it,
              make a live change if asked.
            </Text>
            {app.call_scheduled_at ? (
              <View
                style={[
                  styles.callPill,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Feather name="calendar" size={14} color={colors.primary} />
                <Text style={[styles.callPillText, { color: colors.primary }]}>
                  {new Date(app.call_scheduled_at).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* PASSED */}
        {app.status === "passed" ? (
          <Card style={{ marginTop: 18, alignItems: "center", paddingVertical: 28 }}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Feather name="shield" size={30} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.cardHeadingLg, { color: colors.foreground }]}>
              You&apos;re a Verified Builder
            </Text>
            <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
              The badge has been added to your profile. Companies can now see that your skills have
              been reviewed and confirmed by a BuildHub admin.
            </Text>
            {app.admin_notes ? (
              <View
                style={[
                  styles.notesBox,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.notesText, { color: colors.foreground }]}>
                  <Text style={{ fontFamily: "Inter_700Bold" }}>Admin feedback: </Text>
                  {app.admin_notes}
                </Text>
              </View>
            ) : null}
            <GradientButton
              label="View Builder Directory"
              icon="users"
              onPress={() => router.push("/(tabs)/builders" as Href)}
              style={{ marginTop: 20, alignSelf: "stretch" }}
            />
          </Card>
        ) : null}

        {/* CONDITIONAL PASS */}
        {app.status === "conditional_pass" ? (
          <Card style={{ marginTop: 18 }}>
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.iconCircleSm,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather name="shield" size={18} color={colors.primaryForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardHeading, { color: colors.foreground }]}>
                  Verified — with scope
                </Text>
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                  Conditional verification
                </Text>
              </View>
            </View>
            {app.admin_notes ? (
              <View
                style={[
                  styles.notesBox,
                  { backgroundColor: colors.secondary, borderColor: colors.border, marginTop: 14 },
                ]}
              >
                <Text style={[styles.notesText, { color: colors.foreground }]}>
                  {app.admin_notes}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* FAILED */}
        {app.status === "failed" ? (
          <Card style={{ marginTop: 18, alignItems: "center" }}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
              <Feather name="x-circle" size={28} color={colors.destructive} />
            </View>
            <Text style={[styles.cardHeading, { color: colors.foreground }]}>
              Not verified this time
            </Text>
            <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
              Thanks for applying. Ship more, then try again — verification stays earned.
            </Text>
            {app.admin_notes ? (
              <View
                style={[
                  styles.notesBox,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.notesText, { color: colors.foreground }]}>
                  <Text style={{ fontFamily: "Inter_700Bold" }}>Admin feedback: </Text>
                  {app.admin_notes}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <OutlineButton
          label="Refresh"
          icon="refresh-cw"
          onPress={load}
          style={{ marginTop: 22 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
    marginTop: 6,
  },
  stepperRow: { flexDirection: "row", alignItems: "flex-start" },
  stepCell: { alignItems: "center", gap: 6, minWidth: 56 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  stepLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, textAlign: "center" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconCircleSm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 17, marginBottom: 6, textAlign: "center" },
  cardHeading: { fontFamily: "Inter_700Bold", fontSize: 18 },
  cardHeadingLg: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 4, marginBottom: 10, textAlign: "center" },
  cardBody: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, textAlign: "center" },
  cardMeta: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 10, textAlign: "center" },
  contextBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
  },
  contextLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  contextBody: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 10 },
  reqRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
  reqBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  reqBulletText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  reqText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  linkText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  callPill: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  callPillText: { fontFamily: "Inter_600SemiBold", fontSize: 13.5 },
  notesBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  notesText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  countdownText: { fontFamily: "Inter_700Bold", fontSize: 12.5 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14.5,
  },
  charRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  charCount: { fontFamily: "Inter_700Bold", fontSize: 12 },
  fieldError: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 4 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 6 },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  signInTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 6 },
});
