import { PROJECT_CATEGORIES, type ProjectCategory } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(date);
}

export function isValidCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    SaaS: "bg-violet-500/20 text-violet-300",
    AI: "bg-fuchsia-500/20 text-fuchsia-300",
    Inventory: "bg-amber-500/20 text-amber-300",
    Education: "bg-sky-500/20 text-sky-300",
    Fintech: "bg-emerald-500/20 text-emerald-300",
    Health: "bg-rose-500/20 text-rose-300",
    Logistics: "bg-orange-500/20 text-orange-300",
    "Developer Tools": "bg-indigo-500/20 text-indigo-300",
    Other: "bg-zinc-500/20 text-zinc-300",
  };
  return colors[category] ?? colors.Other;
}
