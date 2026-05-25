"use client";

import { useEffect } from "react";
import { incrementViews } from "@/lib/actions";

/** Increments view count once per page visit (client-side). */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    incrementViews(slug);
  }, [slug]);

  return null;
}
