/**
 * Semantic design tokens for BuildHub Mobile.
 *
 * Mirrors the BuildHub web palette (indigo/violet/blue gradient brand) so the
 * mobile and web artifacts share one visual identity. Supports light + dark.
 */

const colors = {
  light: {
    text: "#0f172a",
    tint: "#4f46e5",

    background: "#ffffff",
    foreground: "#0f172a",

    card: "#f8fafc",
    cardForeground: "#0f172a",

    primary: "#4f46e5",
    primaryForeground: "#ffffff",

    secondary: "#f1f5f9",
    secondaryForeground: "#1e293b",

    muted: "#f1f5f9",
    mutedForeground: "#64748b",

    accent: "#ede9fe",
    accentForeground: "#5b21b6",

    destructive: "#ef4444",
    destructiveForeground: "#ffffff",

    success: "#16a34a",
    warning: "#d97706",

    border: "#e2e8f0",
    input: "#e2e8f0",

    gradientFrom: "#4f46e5",
    gradientVia: "#7c3aed",
    gradientTo: "#2563eb",
    onGradient: "#ffffff",
  },

  dark: {
    text: "#f8fafc",
    tint: "#818cf8",

    background: "#0b0f1a",
    foreground: "#f8fafc",

    card: "#131a2a",
    cardForeground: "#f8fafc",

    primary: "#6366f1",
    primaryForeground: "#ffffff",

    secondary: "#1e293b",
    secondaryForeground: "#f1f5f9",

    muted: "#1e293b",
    mutedForeground: "#94a3b8",

    accent: "#312e81",
    accentForeground: "#c7d2fe",

    destructive: "#f87171",
    destructiveForeground: "#0b0f1a",

    success: "#4ade80",
    warning: "#fbbf24",

    border: "#1e293b",
    input: "#1e293b",

    gradientFrom: "#4f46e5",
    gradientVia: "#7c3aed",
    gradientTo: "#2563eb",
    onGradient: "#ffffff",
  },

  radius: 16,
};

export default colors;
