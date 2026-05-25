import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="btn btn-ghost"
      style={{ padding: "8px", borderRadius: "10px" }}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
      ) : (
        <Moon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
      )}
    </button>
  );
}
