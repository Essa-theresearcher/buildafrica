import { Activity as ActivityIcon, Heart, Rocket, UserPlus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Activity } from "@/lib/types";

const icons = {
  project_launched: Rocket,
  project_liked: Heart,
  builder_joined: UserPlus,
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ba-text-muted">No recent activity yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = icons[item.type] ?? ActivityIcon;
        return (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-ba-border bg-ba-surface px-4 py-3"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ba-surface-elevated">
              <Icon className="h-4 w-4 text-ba-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ba-text">{item.message}</p>
              <p className="mt-0.5 text-xs text-ba-text-muted">
                {formatRelativeTime(item.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
