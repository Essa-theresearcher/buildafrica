"use client";

import { Heart } from "lucide-react";
import { useTransition } from "react";
import { toggleLike } from "@/lib/actions";
import { cn, formatNumber } from "@/lib/utils";

export function LikeButton({
  projectId,
  slug,
  likes,
  initialLiked,
}: {
  projectId: string;
  slug: string;
  likes: number;
  initialLiked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleLike(projectId, slug))}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
        initialLiked
          ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
          : "border-ba-border bg-ba-surface text-ba-text hover:border-ba-accent/50"
      )}
    >
      <Heart className={cn("h-4 w-4", initialLiked && "fill-current")} />
      {formatNumber(likes)} {initialLiked ? "Liked" : "Upvote"}
    </button>
  );
}
