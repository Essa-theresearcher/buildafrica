import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import type { ReputationTag } from "@/types";

export function useTopInset() {
  const insets = useSafeAreaInsets();
  return Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
}

export const CONTENT_BOTTOM_PAD = 120;

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Gradient hero header (tab screens) ─────────────────────────────────────────
export function GradientHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const colors = useColors();
  const topInset = useTopInset();
  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroHeader, { paddingTop: topInset + 14 }]}
    >
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
      {children}
    </LinearGradient>
  );
}

// ── Detail header with back button (stack screens) ────────────────────────────
export function DetailHeader({ title }: { title: string }) {
  const colors = useColors();
  const router = useRouter();
  const topInset = useTopInset();
  return (
    <View
      style={[
        styles.detailHeader,
        {
          paddingTop: topInset + 8,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
        testID="back-button"
      >
        <Feather name="chevron-left" size={24} color={colors.primary} />
      </Pressable>
      <Text style={[styles.detailTitle, { color: colors.foreground }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backBtn} />
    </View>
  );
}

// ── Avatar with gradient fallback ─────────────────────────────────────────────
export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const colors = useColors();
  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: size * 0.36 }}>
        {getInitials(name)}
      </Text>
    </LinearGradient>
  );
}

// ── Reputation tag pill ───────────────────────────────────────────────────────
const tagPalette: Record<ReputationTag, { bg: string; fg: string; icon: any }> = {
  "Verified Builder": { bg: "#ede9fe", fg: "#5b21b6", icon: "check-circle" },
  "Shipped Project": { bg: "#dcfce7", fg: "#166534", icon: "package" },
  "Reliable Collaborator": { bg: "#dbeafe", fg: "#1e40af", icon: "users" },
  "Available for Work": { bg: "#d1fae5", fg: "#065f46", icon: "zap" },
  "Coffee & Code Member": { bg: "#fef3c7", fg: "#92400e", icon: "coffee" },
};

export function Tag({ tag }: { tag: ReputationTag }) {
  const p = tagPalette[tag] || { bg: "#e2e8f0", fg: "#334155", icon: "tag" };
  return (
    <View style={[styles.tag, { backgroundColor: p.bg }]}>
      <Feather name={p.icon} size={11} color={p.fg} />
      <Text style={[styles.tagText, { color: p.fg }]}>{tag}</Text>
    </View>
  );
}

// ── Generic colored pill ──────────────────────────────────────────────────────
export function Pill({
  label,
  bg,
  fg,
  icon,
}: {
  label: string;
  bg: string;
  fg: string;
  icon?: any;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      {icon ? <Feather name={icon} size={11} color={fg} /> : null}
      <Text style={[styles.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ── Skill chip (plain) ────────────────────────────────────────────────────────
export function SkillChip({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.skillChip, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.skillChipText, { color: colors.secondaryForeground }]}>{label}</Text>
    </View>
  );
}

// ── Filter chip (selectable) ──────────────────────────────────────────────────
export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: active ? colors.primary : colors.secondary,
          borderColor: active ? colors.primary : colors.border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: active ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Card surface ──────────────────────────────────────────────────────────────
export function Card({
  children,
  onPress,
  style,
  testID,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}) {
  const colors = useColors();
  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius,
    padding: 16,
  };
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [base, style, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

// ── Search bar ────────────────────────────────────────────────────────────────
export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
    >
      <Feather name="search" size={18} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.searchInput, { color: colors.foreground }]}
        autoCapitalize="none"
        autoCorrect={false}
        testID="search-input"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={10}>
          <Feather name="x" size={18} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Primary gradient button ───────────────────────────────────────────────────
export function GradientButton({
  label,
  onPress,
  icon,
  loading,
  disabled,
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}) {
  const colors = useColors();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [{ opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 }, style]}
    >
      <LinearGradient
        colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBtn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? <Feather name={icon} size={18} color="#fff" /> : null}
            <Text style={styles.gradientBtnText}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ── Secondary (outline) button ────────────────────────────────────────────────
export function OutlineButton({
  label,
  onPress,
  icon,
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: any;
  style?: ViewStyle;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.outlineBtn,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={18} color={colors.primary} /> : null}
      <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon = "inbox",
  title,
  message,
}: {
  icon?: any;
  title: string;
  message?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={26} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      {message ? (
        <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>{message}</Text>
      ) : null}
    </View>
  );
}

// ── Error state with retry ────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="alert-triangle" size={26} color={colors.destructive} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Something went wrong</Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>
        {message || "Please try again."}
      </Text>
      <OutlineButton label="Retry" icon="refresh-cw" onPress={onRetry} style={{ marginTop: 16 }} />
    </View>
  );
}

// ── Skeleton block ────────────────────────────────────────────────────────────
export function Skeleton({ height = 100, style }: { height?: number; style?: ViewStyle }) {
  const colors = useColors();
  return (
    <View
      style={[
        { height, borderRadius: colors.radius, backgroundColor: colors.secondary, opacity: 0.7 },
        style,
      ]}
    />
  );
}

// ── Section title ─────────────────────────────────────────────────────────────
export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.5 },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 32, alignItems: "flex-start", justifyContent: "center" },
  detailTitle: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 17 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11.5 },
  skillChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  skillChipText: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  gradientBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15.5 },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  outlineBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, textAlign: "center" },
  emptyMessage: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: -0.3 },
});

export { styles as uiStyles };
