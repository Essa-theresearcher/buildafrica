import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
  Pill,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";

interface PromoteStartup {
  id: string;
  name: string;
  slug: string;
  marketing_tier: string;
  is_featured: boolean;
  featured_until?: string;
  is_spotlight: boolean;
  spotlight_until?: string;
  is_startup_of_week: boolean;
  total_views: number;
  total_upvotes: number;
  founder_clerk_id: string;
}

interface MarketingPackage {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  features: string[];
  price_usd: number;
  duration_days: number;
}

const tierLabels: Record<string, string> = {
  free: "Free",
  featured: "Featured",
  spotlight: "Spotlight",
  premium: "Premium",
};

export default function StartupPromoteScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, isSignedIn, isLoaded } = useUser();

  const [startup, setStartup] = useState<PromoteStartup | null>(null);
  const [packages, setPackages] = useState<MarketingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<MarketingPackage | null>(null);
  const [waitlistDone, setWaitlistDone] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!slug) return;
    setError(null);
    setLoading(true);
    try {
      const [sd, pd] = await Promise.all([
        apiFetch<{ startup: PromoteStartup }>(`/api/startups/${slug}`),
        apiFetch<{ packages: MarketingPackage[] }>("/api/marketing/packages"),
      ]);
      setStartup(sd.startup);
      setPackages(pd.packages || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load startup");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!isLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Promote" />
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Promote" />
        <ErrorState message={error} onRetry={load} />
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Promote" />
        <View style={styles.gateWrap}>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Sign in required</Text>
          <Text style={[styles.gateBody, { color: colors.mutedForeground }]}>
            Sign in to manage your startup&apos;s promotions.
          </Text>
        </View>
      </View>
    );
  }

  if (!startup || user?.id !== startup.founder_clerk_id) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Promote" />
        <View style={styles.gateWrap}>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Access denied</Text>
          <Text style={[styles.gateBody, { color: colors.mutedForeground }]}>
            Only the startup founder can access this page.
          </Text>
        </View>
      </View>
    );
  }

  const expiryDate = startup.featured_until
    ? new Date(startup.featured_until).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DetailHeader title={`Promote ${startup.name}`} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="zap" size={16} color={colors.warning} />
          <Text style={[styles.eyebrow, { color: colors.warning }]}>Paid marketing</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Get more eyes on {startup.name}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Reach builders, companies, and early users already looking for products like yours.
        </Text>

        {/* Status card */}
        <Card style={{ marginTop: 24 }}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                CURRENT TIER
              </Text>
              <Text
                style={[
                  styles.statValueTier,
                  {
                    color:
                      startup.marketing_tier === "free"
                        ? colors.mutedForeground
                        : colors.primary,
                  },
                ]}
              >
                {tierLabels[startup.marketing_tier] || startup.marketing_tier}
              </Text>
              {expiryDate && startup.marketing_tier !== "free" ? (
                <Text style={[styles.statHint, { color: colors.mutedForeground }]}>
                  Expires {expiryDate}
                </Text>
              ) : null}
            </View>
            <View style={styles.statDivider} />
            <View style={[styles.statItem, { alignItems: "center" }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>VIEWS</Text>
              <View style={styles.statValueRow}>
                <Feather name="eye" size={16} color={colors.foreground} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {startup.total_views}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={[styles.statItem, { alignItems: "center" }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>UPVOTES</Text>
              <View style={styles.statValueRow}>
                <Feather name="arrow-up" size={16} color={colors.foreground} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {startup.total_upvotes}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Packages */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Packages</Text>
        <View style={{ gap: 14, marginTop: 12 }}>
          {packages.map((pkg, idx) => {
            const isPopular = idx === 1;
            const isDone = !!waitlistDone[pkg.slug];
            return (
              <Card
                key={pkg.id}
                style={{
                  borderColor: isPopular ? colors.primary : colors.border,
                  borderWidth: isPopular ? 2 : 1,
                }}
              >
                {isPopular ? (
                  <View style={{ alignSelf: "flex-start", marginBottom: 10 }}>
                    <Pill
                      label="Most popular"
                      bg={colors.primary}
                      fg={colors.primaryForeground}
                      icon="star"
                    />
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather
                    name={idx === 0 ? "star" : idx === 1 ? "zap" : "award"}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.pkgName, { color: colors.foreground }]}>{pkg.name}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 10 }}>
                  <Text style={[styles.pkgPrice, { color: colors.foreground }]}>
                    ${pkg.price_usd}
                  </Text>
                  <Text style={[styles.pkgPer, { color: colors.mutedForeground }]}>
                    {" "}
                    / week
                  </Text>
                </View>
                <Text style={[styles.pkgTagline, { color: colors.mutedForeground }]}>
                  {pkg.tagline}
                </Text>
                <View style={{ gap: 8, marginTop: 14 }}>
                  {(pkg.features || []).map((f, fi) => (
                    <View key={fi} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                      <Feather
                        name="check"
                        size={14}
                        color={colors.success}
                        style={{ marginTop: 3 }}
                      />
                      <Text style={[styles.pkgFeature, { color: colors.foreground }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <GradientButton
                  label={isDone ? "On the waitlist ✓" : `Get ${pkg.name}`}
                  icon={isDone ? "check" : "arrow-right"}
                  onPress={() => !isDone && setSelectedPkg(pkg)}
                  disabled={isDone}
                  style={{ marginTop: 18 }}
                />
              </Card>
            );
          })}
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          All paid features are coming soon. Joining the waitlist gets you first access + your first
          week free.
        </Text>
      </ScrollView>

      {selectedPkg && startup ? (
        <WaitlistModal
          pkg={selectedPkg}
          startup={startup}
          defaultEmail={user?.primaryEmailAddress?.emailAddress || ""}
          onClose={() => setSelectedPkg(null)}
          onJoined={(slug) => {
            setWaitlistDone((d) => ({ ...d, [slug]: true }));
            setSelectedPkg(null);
          }}
        />
      ) : null}
    </View>
  );
}

function WaitlistModal({
  pkg,
  startup,
  defaultEmail,
  onClose,
  onJoined,
}: {
  pkg: MarketingPackage;
  startup: PromoteStartup;
  defaultEmail: string;
  onClose: () => void;
  onJoined: (slug: string) => void;
}) {
  const colors = useColors();
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!email.includes("@")) {
      setErr("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await apiFetch("/api/marketing/waitlist", {
        method: "POST",
        body: JSON.stringify({
          email,
          startup_id: startup.id,
          startup_name: startup.name,
          package_interest: pkg.slug,
          message: message || null,
        }),
      });
      setSubmitted(true);
    } catch (e: any) {
      setErr(e?.message || "Failed to join waitlist");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalSheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="zap" size={16} color={colors.warning} />
              <Text style={[styles.modalEyebrow, { color: colors.warning }]}>{pkg.name}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {!submitted ? (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                You are early — and that&apos;s a good thing.
              </Text>
              <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
                Paid marketing is launching soon on BuildHub. Join the waitlist and you&apos;ll be
                first to activate this. Early members get their first week free.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 18 }]}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.card,
                  },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 14 }]}>
                Message{" "}
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="What would make this valuable for your startup?"
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    minHeight: 90,
                    textAlignVertical: "top",
                  },
                ]}
              />

              {err ? (
                <Text style={[styles.modalError, { color: colors.destructive }]}>{err}</Text>
              ) : null}

              <GradientButton
                label={submitting ? "Joining…" : "Join the waitlist"}
                icon="send"
                onPress={submit}
                loading={submitting}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <View
                style={[
                  styles.successCircle,
                  { borderColor: colors.success, backgroundColor: colors.accent },
                ]}
              >
                <Feather name="check" size={28} color={colors.success} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.foreground, marginTop: 16 }]}>
                You&apos;re on the list.
              </Text>
              <Text
                style={[
                  styles.modalBody,
                  { color: colors.mutedForeground, textAlign: "center", marginTop: 8 },
                ]}
              >
                We&apos;ll email you at <Text style={{ fontFamily: "Inter_600SemiBold" }}>{email}</Text>{" "}
                when paid marketing goes live.
              </Text>
              <Text
                style={{
                  color: colors.success,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
                Your first week is on us.
              </Text>
              <GradientButton
                label="Close"
                icon="check"
                onPress={() => onJoined(pkg.slug)}
                style={{ marginTop: 24, alignSelf: "stretch" }}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5, marginTop: 2 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 22, marginTop: 10 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1 },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(127,127,127,0.2)" },
  statLabel: { fontFamily: "Inter_700Bold", fontSize: 10.5, letterSpacing: 0.6 },
  statValueTier: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 4 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  statValueRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  statHint: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 28 },
  pkgName: { fontFamily: "Inter_700Bold", fontSize: 16 },
  pkgPrice: { fontFamily: "Inter_700Bold", fontSize: 30, letterSpacing: -0.5 },
  pkgPer: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 4 },
  pkgTagline: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, marginTop: 8 },
  pkgFeature: { fontFamily: "Inter_400Regular", fontSize: 14, flex: 1, lineHeight: 20 },
  disclaimer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },
  modalSheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    maxHeight: "85%",
  },
  modalEyebrow: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: -0.3 },
  modalBody: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginTop: 8 },
  modalError: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 10 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
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
