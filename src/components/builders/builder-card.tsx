import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import type { Profile } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function BuilderCard({ builder, rank }: { builder: Profile; rank?: number }) {
  return (
    <Link
      href={`/builders/${builder.username}`}
      className="flex items-center gap-4 rounded-2xl border border-ba-border bg-ba-surface p-4 transition-all hover:border-ba-accent/40"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ba-surface-elevated">
        {builder.avatar_url ? (
          <Image
            src={builder.avatar_url}
            alt={builder.full_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-lg font-bold text-ba-accent">
            {builder.full_name.charAt(0)}
          </div>
        )}
        {rank !== undefined && rank <= 3 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ba-accent text-[10px] font-bold text-white">
            {rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-ba-text">{builder.full_name}</h3>
        <p className="text-sm text-ba-text-muted">@{builder.username}</p>
        {builder.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ba-text-muted">
            <MapPin className="h-3 w-3" />
            {builder.location}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1 text-sm font-medium text-ba-accent">
          <Trophy className="h-4 w-4" />
          {formatNumber(builder.build_score)}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-ba-text-muted">
          Build Score
        </span>
      </div>
    </Link>
  );
}
