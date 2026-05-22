import { Calendar, Star } from "lucide-react";
import { PlaceholderBadge } from "@/components/ui/badge";

export function PromoBanners() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-ba-border bg-gradient-to-br from-ba-accent/20 to-ba-surface p-6">
        <PlaceholderBadge>Coming soon</PlaceholderBadge>
        <div className="mt-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-ba-accent" />
          <h3 className="font-semibold text-ba-text">Builder of the Week</h3>
        </div>
        <p className="mt-2 text-sm text-ba-text-muted">
          Top builders will be highlighted here. Placeholder for V1 momentum.
        </p>
      </div>
      <div className="rounded-2xl border border-ba-border bg-gradient-to-br from-ba-accent-blue/20 to-ba-surface p-6">
        <PlaceholderBadge>Every Friday</PlaceholderBadge>
        <div className="mt-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-ba-accent-blue" />
          <h3 className="font-semibold text-ba-text">Launch Friday</h3>
        </div>
        <p className="mt-2 text-sm text-ba-text-muted">
          Batch your launches for maximum visibility. Banner placeholder for V1.
        </p>
      </div>
    </div>
  );
}
