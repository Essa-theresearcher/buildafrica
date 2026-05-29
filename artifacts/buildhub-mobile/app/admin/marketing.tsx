import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  EmptyState,
  GradientButton,
  OutlineButton,
  Pill,
  SectionTitle,
} from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { apiFetch } from "@/lib/api";

interface WaitlistEntry {
  id: string;
  email: string;
  startup_name?: string;
  startup_name_actual?: string;
  package_interest: string;
  message?: string;
  created_at: string;
}

interface ActivePromotion {
  id: string;
  name: string;
  slug: string;
  marketing_tier: string;
  is_featured: boolean;
  featured_until?: string;
  is_spotlight: boolean;
  is_startup_of_week: boolean;
  startup_of_week_date?: string;
}

interface StartupSearchResult {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url?: string;
  category: string;
  stage: string;
}

const PACKAGE_LABELS: Record<string, string> = {
  featured: "Featured Listing",
  spotlight: "Homepage Spotlight",
  startup_of_week: "Startup of the Week",
  premium: "Premium",
};

const PACKAGE_OPTIONS = [
  { value: "featured", label: "Featured Listing" },
  { value: "spotlight", label: "Homepage Spotlight" },
  { value: "premium", label: "Premium" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default function AdminMarketingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const isAdmin = useIsAdmin();

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [loading, setLoading] = useState(true);

  const [sotwModal, setSotwModal] = useState(false);
  const [mfModal, setMfModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wd, pd] = await Promise.all([
        apiFetch<{ waitlist: WaitlistEntry[] }>("/api/marketing/admin/waitlist").catch(() => ({ waitlist: [] })),
        apiFetch<{ promotions: ActivePromotion[] }>("/api/marketing/admin/active").catch(() => ({ promotions: [] })),
      ]);
      setWaitlist(wd.waitlist || []);
      setPromotions(pd.promotions || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isAdmin) load();
  }, [isLoaded, isAdmin, load]);

  const removePromotion = async (id: string) => {
    try {
      await apiFetch("/api/marketing/admin/remove-promotion", {
        method: "POST",
        body: JSON.stringify({ startup_id: id }),
      });
      setPromotions((p) => p.filter((x) => x.id !== id));
    } catch {
      // swallow
    }
  };

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Marketing" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DetailHeader title="Marketing" />
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
        <DetailHeader title="Marketing" />
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
      <DetailHeader title="Marketing" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: CONTENT_BOTTOM_PAD }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subhead, { color: colors.mutedForeground }]}>
          Manage promotions, waitlist signups, and featured startups.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
        ) : (
          <>
            {/* Waitlist */}
            <View style={{ marginTop: 12 }}>
              <SectionTitle title={`Waitlist (${waitlist.length})`} />
              {waitlist.length === 0 ? (
                <EmptyState icon="users" title="No waitlist entries" message="No one has signed up yet." />
              ) : (
                <View style={{ gap: 10 }}>
                  {waitlist.slice(0, 10).map((entry) => (
                    <Card key={entry.id}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <Text style={[styles.email, { color: colors.foreground }]} numberOfLines={1}>
                          {entry.email}
                        </Text>
                        <Pill
                          label={PACKAGE_LABELS[entry.package_interest] || entry.package_interest}
                          bg={colors.accent}
                          fg={colors.primary}
                        />
                      </View>
                      <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {entry.startup_name_actual || entry.startup_name || "—"} · {timeAgo(entry.created_at)}
                      </Text>
                      {entry.message ? (
                        <Text style={[styles.meta, { color: colors.mutedForeground, marginTop: 6 }]} numberOfLines={3}>
                          {entry.message}
                        </Text>
                      ) : null}
                    </Card>
                  ))}
                  {waitlist.length > 10 ? (
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                      +{waitlist.length - 10} more entries
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Active Promotions */}
            <View style={{ marginTop: 28 }}>
              <SectionTitle title="Active Promotions" />
              {promotions.length === 0 ? (
                <EmptyState icon="trending-up" title="No active promotions" />
              ) : (
                <View style={{ gap: 10 }}>
                  {promotions.map((p) => (
                    <Card key={p.id}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.email, { color: colors.foreground }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                            <Pill label={p.marketing_tier} bg={colors.accent} fg={colors.primary} />
                            {p.featured_until ? (
                              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                                until {new Date(p.featured_until).toLocaleDateString()}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                        <Pressable
                          onPress={() => removePromotion(p.id)}
                          style={({ pressed }) => [
                            styles.removeBtn,
                            { borderColor: colors.destructive },
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Feather name="x" size={14} color={colors.destructive} />
                          <Text style={[styles.removeBtnText, { color: colors.destructive }]}>Remove</Text>
                        </Pressable>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={{ marginTop: 28, gap: 12 }}>
              <SectionTitle title="Quick Actions" />
              <GradientButton
                label="Set Startup of the Week"
                icon="star"
                onPress={() => setSotwModal(true)}
              />
              <OutlineButton
                label="Manually Feature a Startup"
                icon="zap"
                onPress={() => setMfModal(true)}
              />
            </View>
          </>
        )}
      </ScrollView>

      {sotwModal ? (
        <SotwModal
          onClose={() => setSotwModal(false)}
          onDone={() => {
            setSotwModal(false);
            load();
          }}
        />
      ) : null}

      {mfModal ? (
        <ManualFeatureModal
          onClose={() => setMfModal(false)}
          onDone={() => {
            setMfModal(false);
            load();
          }}
        />
      ) : null}
    </View>
  );
}

function SotwModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StartupSearchResult[]>([]);
  const [selected, setSelected] = useState<StartupSearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      try {
        const { startups } = await apiFetch<{ startups: StartupSearchResult[] }>(
          `/api/startups/search?q=${encodeURIComponent(q)}`,
        );
        setResults(startups || []);
      } catch {
        setResults([]);
      }
    }, 300);
  };

  const confirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/marketing/admin/set-startup-of-week", {
        method: "POST",
        body: JSON.stringify({ startup_id: selected.id }),
      });
      onDone();
    } catch (e: any) {
      setError(e?.message || "Failed to set startup of the week");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Set Startup of the Week" onClose={onClose}>
      {selected ? (
        <View style={[modalStyles.selectedBox, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[modalStyles.selectedName, { color: colors.foreground }]}>{selected.name}</Text>
            <Text style={[modalStyles.selectedSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {selected.tagline}
            </Text>
          </View>
          <Pressable onPress={() => setSelected(null)} hitSlop={10}>
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      ) : (
        <>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search startup by name…"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            style={[
              modalStyles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
          />
          {results.length > 0 ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              {results.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    setSelected(s);
                    setResults([]);
                    setQuery("");
                  }}
                  style={({ pressed }) => [
                    modalStyles.searchResult,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[modalStyles.selectedName, { color: colors.foreground }]}>{s.name}</Text>
                  <Text style={[modalStyles.selectedSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {s.tagline}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}

      {selected ? (
        <Text style={[modalStyles.note, { color: colors.mutedForeground, marginTop: 16 }]}>
          This will set <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{selected.name}</Text>{" "}
          as Startup of the Week and feature them for 7 days. Any existing SOTW will be cleared.
        </Text>
      ) : null}

      {error ? <Text style={[modalStyles.error, { color: colors.destructive }]}>{error}</Text> : null}

      {selected ? (
        <GradientButton
          label="Confirm"
          icon="check"
          onPress={confirm}
          loading={submitting}
          style={{ marginTop: 20 }}
        />
      ) : null}
    </ModalShell>
  );
}

function ManualFeatureModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StartupSearchResult[]>([]);
  const [selected, setSelected] = useState<StartupSearchResult | null>(null);
  const [pkg, setPkg] = useState("featured");
  const [until, setUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      try {
        const { startups } = await apiFetch<{ startups: StartupSearchResult[] }>(
          `/api/startups/search?q=${encodeURIComponent(q)}`,
        );
        setResults(startups || []);
      } catch {
        setResults([]);
      }
    }, 300);
  };

  const submit = async () => {
    if (!selected) {
      setError("Select a startup first");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) {
      setError("Featured until must be in YYYY-MM-DD format");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/marketing/admin/manual-feature", {
        method: "POST",
        body: JSON.stringify({
          startup_id: selected.id,
          package_slug: pkg,
          featured_until: until,
        }),
      });
      onDone();
    } catch (e: any) {
      setError(e?.message || "Failed to feature startup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Manually Feature Startup" onClose={onClose}>
      <Text style={[modalStyles.note, { color: colors.mutedForeground }]}>
        For founders who paid via bank transfer or mobile money.
      </Text>

      <Text style={[modalStyles.fieldLabel, { color: colors.foreground, marginTop: 18 }]}>Startup</Text>
      {selected ? (
        <View style={[modalStyles.selectedBox, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
          <Text style={[modalStyles.selectedName, { color: colors.foreground, flex: 1 }]}>{selected.name}</Text>
          <Pressable onPress={() => setSelected(null)} hitSlop={10}>
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      ) : (
        <>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search startup by name…"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            style={[
              modalStyles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
          />
          {results.length > 0 ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              {results.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    setSelected(s);
                    setResults([]);
                    setQuery("");
                  }}
                  style={({ pressed }) => [
                    modalStyles.searchResult,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[modalStyles.selectedName, { color: colors.foreground }]}>{s.name}</Text>
                  <Text style={[modalStyles.selectedSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {s.tagline}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}

      <Text style={[modalStyles.fieldLabel, { color: colors.foreground, marginTop: 18 }]}>Package</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {PACKAGE_OPTIONS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => setPkg(p.value)}
            style={({ pressed }) => [
              modalStyles.pkgBtn,
              {
                backgroundColor: pkg === p.value ? colors.primary : colors.card,
                borderColor: pkg === p.value ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                modalStyles.pkgBtnText,
                { color: pkg === p.value ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[modalStyles.fieldLabel, { color: colors.foreground, marginTop: 18 }]}>
        Featured Until (YYYY-MM-DD)
      </Text>
      <TextInput
        value={until}
        onChangeText={setUntil}
        placeholder="2024-12-31"
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="none"
        style={[
          modalStyles.input,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
        ]}
      />

      {error ? <Text style={[modalStyles.error, { color: colors.destructive }]}>{error}</Text> : null}

      <GradientButton
        label="Activate Promotion"
        icon="zap"
        onPress={submit}
        loading={submitting}
        disabled={!selected}
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
  subhead: { fontFamily: "Inter_400Regular", fontSize: 14.5, marginTop: 4, marginBottom: 8, lineHeight: 21 },
  email: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  meta: { fontFamily: "Inter_400Regular", fontSize: 12.5 },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  removeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
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
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 8 },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 6,
  },
  selectedName: { fontFamily: "Inter_600SemiBold", fontSize: 14.5 },
  selectedSub: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 2 },
  searchResult: { padding: 12, borderRadius: 12, borderWidth: 1 },
  pkgBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  pkgBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
});
