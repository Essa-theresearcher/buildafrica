import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
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
  OutlineButton,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";

type Stage = "building" | "launched" | "growing";
type Category =
  | "fintech"
  | "edtech"
  | "healthtech"
  | "logistics"
  | "saas"
  | "agritech"
  | "ecommerce"
  | "developer_tools"
  | "other";

const categoryOptions: { value: Category; label: string; icon: string }[] = [
  { value: "fintech", label: "Fintech", icon: "💳" },
  { value: "edtech", label: "EdTech", icon: "📚" },
  { value: "healthtech", label: "HealthTech", icon: "🏥" },
  { value: "logistics", label: "Logistics", icon: "🚚" },
  { value: "saas", label: "SaaS", icon: "☁️" },
  { value: "agritech", label: "AgriTech", icon: "🌾" },
  { value: "ecommerce", label: "eCommerce", icon: "🛒" },
  { value: "developer_tools", label: "Dev Tools", icon: "⚙️" },
  { value: "other", label: "Other", icon: "🔧" },
];

const stageOptions: { value: Stage; label: string; desc: string }[] = [
  { value: "building", label: "Building", desc: "I am building. Not launched yet." },
  { value: "launched", label: "Launched", desc: "Live product. Early users." },
  { value: "growing", label: "Growing", desc: "Real traction. Paying users or significant free base." },
];

const lookingForOptions = [
  { value: "co-founder", label: "Co-founder" },
  { value: "engineer", label: "Engineer" },
  { value: "designer", label: "Designer" },
  { value: "first-users", label: "First Users" },
  { value: "feedback", label: "Feedback" },
  { value: "investment", label: "Investment" },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function validateUrl(url: string) {
  if (!url) return true;
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

const STEPS = ["Basics", "Story", "Team & Media"];

export default function StartupNewScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lookingForTag, setLookingForTag] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    category: "" as Category | "",
    stage: "" as Stage | "",
    problem_solved: "",
    description: "",
    demo_url: "",
    product_url: "",
    github_url: "",
    looking_for: [] as string[],
    is_hiring: false,
    logo_url: "",
    cover_image_url: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Add startup" />
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Add startup" />
        <View style={styles.gateWrap}>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>
            Sign in to add your startup
          </Text>
          <Text style={[styles.gateBody, { color: colors.mutedForeground }]}>
            You need a BuildHub account to showcase your startup.
          </Text>
          <GradientButton
            label="Sign in"
            icon="log-in"
            onPress={() => router.push("/(auth)/sign-in" as any)}
            style={{ marginTop: 24, alignSelf: "stretch" }}
          />
        </View>
      </View>
    );
  }

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
    }
  }

  function checkSlug(slug: string) {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }
    if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
    setSlugChecking(true);
    slugCheckRef.current = setTimeout(async () => {
      try {
        const d = await apiFetch<{ available: boolean }>("/api/startups/check-slug", {
          method: "POST",
          body: JSON.stringify({ slug }),
        });
        setSlugAvailable(d.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
  }

  function handleNameChange(name: string) {
    set("name", name);
    const slug = slugify(name);
    set("slug", slug);
    checkSlug(slug);
  }

  function toggleLookingFor(v: string) {
    set(
      "looking_for",
      form.looking_for.includes(v)
        ? form.looking_for.filter((x) => x !== v)
        : [...form.looking_for, v],
    );
  }

  function addLookingForTag() {
    const v = lookingForTag.trim();
    if (v && !form.looking_for.includes(v)) {
      set("looking_for", [...form.looking_for, v]);
    }
    setLookingForTag("");
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Startup name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (slugAvailable === false) e.slug = "This slug is taken. Try another.";
    if (!form.tagline.trim()) e.tagline = "Tagline is required";
    if (form.tagline.length > 100) e.tagline = "Max 100 characters";
    if (!form.category) e.category = "Choose a category";
    if (!form.stage) e.stage = "Choose a stage";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.problem_solved.trim() || form.problem_solved.length < 100)
      e.problem_solved = "Describe the problem in at least 100 characters";
    if (!form.description.trim() || form.description.length < 100)
      e.description = "Describe your product in at least 100 characters";
    if (form.demo_url && !validateUrl(form.demo_url)) e.demo_url = "Enter a valid URL";
    if (form.product_url && !validateUrl(form.product_url)) e.product_url = "Enter a valid URL";
    if (form.github_url && !validateUrl(form.github_url)) e.github_url = "Enter a valid URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        ...form,
        demo_url: form.demo_url
          ? form.demo_url.startsWith("http")
            ? form.demo_url
            : `https://${form.demo_url}`
          : "",
        product_url: form.product_url
          ? form.product_url.startsWith("http")
            ? form.product_url
            : `https://${form.product_url}`
          : "",
        github_url: form.github_url
          ? form.github_url.startsWith("http")
            ? form.github_url
            : `https://${form.github_url}`
          : "",
      };
      await apiFetch<{ startup: { slug: string } }>("/api/startups", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.replace("/portal/startup" as any);
    } catch (err: any) {
      const msg = err?.message || "Failed to create startup";
      setSubmitError(
        msg.includes("already have a startup") ? "You already have a startup on BuildHub." : msg,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title="Add your startup" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Showcase what you&apos;re building to the BuildHub community.
        </Text>

        {/* Progress */}
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => {
            const completed = step > i + 1;
            const active = step === i + 1;
            return (
              <View key={s} style={styles.progressItem}>
                <View style={styles.progressCol}>
                  <View
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: completed
                          ? colors.success
                          : active
                            ? colors.primary
                            : colors.secondary,
                        borderColor: completed
                          ? colors.success
                          : active
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  >
                    {completed ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : (
                      <Text
                        style={{
                          color: active ? "#fff" : colors.mutedForeground,
                          fontFamily: "Inter_700Bold",
                          fontSize: 13,
                        }}
                      >
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.progressLabel,
                      { color: active ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {s}
                  </Text>
                </View>
                {i < STEPS.length - 1 ? (
                  <View
                    style={[
                      styles.progressLine,
                      { backgroundColor: completed ? colors.success : colors.border },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>

        {/* STEP 1 */}
        {step === 1 && (
          <View>
            <Field label="Startup name" required error={errors.name}>
              <Input
                value={form.name}
                onChangeText={handleNameChange}
                placeholder="e.g. DukaFlow"
              />
            </Field>

            <Field
              label="URL slug"
              required
              error={errors.slug}
              hint={`buildhub.com/startups/${form.slug || "your-slug"}`}
            >
              <Input
                value={form.slug}
                onChangeText={(v: string) => {
                  set("slug", v);
                  checkSlug(v);
                }}
                placeholder="your-startup"
                autoCapitalize="none"
              />
              <Text
                style={[
                  styles.slugStatus,
                  {
                    color: slugChecking
                      ? colors.mutedForeground
                      : slugAvailable === true
                        ? colors.success
                        : slugAvailable === false
                          ? colors.destructive
                          : colors.mutedForeground,
                  },
                ]}
              >
                {slugChecking
                  ? "Checking…"
                  : slugAvailable === true
                    ? "✓ Available"
                    : slugAvailable === false
                      ? "✗ Taken"
                      : " "}
              </Text>
            </Field>

            <Field
              label="Tagline"
              required
              error={errors.tagline}
              hint={`${form.tagline.length}/100 characters`}
            >
              <Input
                value={form.tagline}
                onChangeText={(v: string) => set("tagline", v)}
                placeholder="One sentence. What do you do?"
                maxLength={100}
              />
            </Field>

            <Field label="Category" required error={errors.category}>
              <View style={styles.gridWrap}>
                {categoryOptions.map((c) => {
                  const selected = form.category === c.value;
                  return (
                    <Pressable
                      key={c.value}
                      onPress={() => set("category", c.value)}
                      style={({ pressed }) => [
                        styles.gridChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.accent : colors.card,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={{ fontSize: 15 }}>{c.icon}</Text>
                      <Text
                        style={[
                          styles.gridChipText,
                          { color: selected ? colors.primary : colors.foreground },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Stage" required error={errors.stage}>
              <View style={{ gap: 10 }}>
                {stageOptions.map((s) => {
                  const selected = form.stage === s.value;
                  return (
                    <Pressable
                      key={s.value}
                      onPress={() => set("stage", s.value)}
                      style={({ pressed }) => [
                        styles.stageCard,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.accent : colors.card,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {selected ? (
                          <Feather name="check" size={14} color={colors.primary} />
                        ) : null}
                        <Text
                          style={[
                            styles.stageLabel,
                            { color: selected ? colors.primary : colors.foreground },
                          ]}
                        >
                          {s.label}
                        </Text>
                      </View>
                      <Text style={[styles.stageDesc, { color: colors.mutedForeground }]}>
                        {s.desc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <GradientButton
              label="Continue"
              icon="arrow-right"
              onPress={() => {
                if (validateStep1()) setStep(2);
              }}
              style={{ marginTop: 28 }}
            />
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View>
            <Field
              label="The problem"
              required
              error={errors.problem_solved}
              hint={`${form.problem_solved.length} chars (min 100)`}
            >
              <Input
                value={form.problem_solved}
                onChangeText={(v: string) => set("problem_solved", v)}
                placeholder="What specific problem do you solve? Who has this problem? How are they dealing with it today?"
                multiline
                style={{ minHeight: 110, textAlignVertical: "top" }}
              />
            </Field>

            <Field
              label="The product"
              required
              error={errors.description}
              hint={`${form.description.length} chars (min 100)`}
            >
              <Input
                value={form.description}
                onChangeText={(v: string) => set("description", v)}
                placeholder="Describe your product. What does it do? How does it work?"
                multiline
                style={{ minHeight: 110, textAlignVertical: "top" }}
              />
            </Field>

            <Field label="Demo URL" error={errors.demo_url}>
              <Input
                value={form.demo_url}
                onChangeText={(v: string) => set("demo_url", v)}
                placeholder="https://demo.yourapp.com"
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <Field label="Product URL" error={errors.product_url}>
              <Input
                value={form.product_url}
                onChangeText={(v: string) => set("product_url", v)}
                placeholder="https://yourapp.com"
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <Field label="GitHub URL" error={errors.github_url}>
              <Input
                value={form.github_url}
                onChangeText={(v: string) => set("github_url", v)}
                placeholder="https://github.com/you/repo"
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <Field label="Looking for" hint="Tap to toggle. Add custom tags below.">
              <View style={styles.gridWrap}>
                {lookingForOptions.map((o) => {
                  const selected = form.looking_for.includes(o.value);
                  return (
                    <Pressable
                      key={o.value}
                      onPress={() => toggleLookingFor(o.value)}
                      style={({ pressed }) => [
                        styles.gridChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.accent : colors.card,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      {selected ? (
                        <Feather name="check" size={13} color={colors.primary} />
                      ) : null}
                      <Text
                        style={[
                          styles.gridChipText,
                          { color: selected ? colors.primary : colors.foreground },
                        ]}
                      >
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={lookingForTag}
                    onChangeText={setLookingForTag}
                    placeholder="Add custom tag"
                    onSubmitEditing={addLookingForTag}
                    returnKeyType="done"
                  />
                </View>
                <Pressable
                  onPress={addLookingForTag}
                  style={({ pressed }) => [
                    styles.addBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Feather name="plus" size={20} color={colors.primaryForeground} />
                </Pressable>
              </View>

              {form.looking_for.filter((v) => !lookingForOptions.find((o) => o.value === v)).length >
              0 ? (
                <View style={[styles.gridWrap, { marginTop: 10 }]}>
                  {form.looking_for
                    .filter((v) => !lookingForOptions.find((o) => o.value === v))
                    .map((t) => (
                      <Pressable
                        key={t}
                        onPress={() =>
                          set(
                            "looking_for",
                            form.looking_for.filter((x) => x !== t),
                          )
                        }
                      >
                        <View
                          style={[
                            styles.customTag,
                            { backgroundColor: colors.secondary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.gridChipText,
                              { color: colors.secondaryForeground },
                            ]}
                          >
                            {t}
                          </Text>
                          <Feather name="x" size={13} color={colors.mutedForeground} />
                        </View>
                      </Pressable>
                    ))}
                </View>
              ) : null}
            </Field>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 28 }}>
              <OutlineButton
                label="Back"
                icon="arrow-left"
                onPress={() => setStep(1)}
                style={{ flex: 1 }}
              />
              <GradientButton
                label="Continue"
                icon="arrow-right"
                onPress={() => {
                  if (validateStep2()) setStep(3);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View>
            <Field
              label="Logo URL"
              hint="Paste a direct URL to your logo image (PNG, SVG, JPG)"
            >
              <Input
                value={form.logo_url}
                onChangeText={(v: string) => set("logo_url", v)}
                placeholder="https://yourapp.com/logo.png"
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <Field
              label="Cover image URL"
              hint="Wide banner image (1200×300 recommended)"
            >
              <Input
                value={form.cover_image_url}
                onChangeText={(v: string) => set("cover_image_url", v)}
                placeholder="https://yourapp.com/cover.jpg"
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <View
              style={[
                styles.hiringRow,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.hiringLabel, { color: colors.foreground }]}>
                  We&apos;re hiring
                </Text>
                <Text style={[styles.hiringHint, { color: colors.mutedForeground }]}>
                  Show a &quot;Hiring&quot; badge on your startup card
                </Text>
              </View>
              <Switch
                value={form.is_hiring}
                onValueChange={(v) => set("is_hiring", v)}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>

            {submitError ? (
              <Text style={[styles.errorText, { color: colors.destructive, marginTop: 16 }]}>
                {submitError}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 28 }}>
              <OutlineButton
                label="Back"
                icon="arrow-left"
                onPress={() => setStep(2)}
                style={{ flex: 1 }}
              />
              <GradientButton
                label={submitting ? "Submitting…" : "Publish startup"}
                icon="check"
                onPress={handleSubmit}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
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
      {error ? (
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hintText, { color: colors.mutedForeground }]}>{hint}</Text>
      ) : null}
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
        props.style,
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
  errorText: { fontFamily: "Inter_500Medium", fontSize: 12.5, marginTop: 6 },
  hintText: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 6 },
  slugStatus: { fontFamily: "Inter_600SemiBold", fontSize: 12.5, marginTop: 6 },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
    marginBottom: 8,
  },
  progressItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressCol: { alignItems: "center", gap: 6, width: 70 },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  progressLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  progressLine: { flex: 1, height: 2, marginHorizontal: 4, marginTop: -18 },
  gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  gridChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  stageCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  stageLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  stageDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  addBtn: { width: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  customTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  hiringRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  hiringLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  hiringHint: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  gateWrap: { padding: 40, alignItems: "center" },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, textAlign: "center" },
  gateBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
