import { cn, getCategoryColor } from "@/lib/utils";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium",
        getCategoryColor(category)
      )}
    >
      {category}
    </span>
  );
}

export function PlaceholderBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-dashed border-ba-accent/40 bg-ba-accent/10 px-2.5 py-0.5 text-xs font-medium text-ba-accent">
      {children}
    </span>
  );
}
