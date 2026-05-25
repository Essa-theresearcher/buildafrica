import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).clerkUserId = userId;
  next();
}

// Admin is determined by a hardcoded env var list of Clerk user IDs.
// Set ADMIN_CLERK_IDS as a comma-separated list of Clerk user IDs.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const adminIds = (process.env.ADMIN_CLERK_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!adminIds.includes(userId)) {
    res.status(403).json({ error: "Forbidden — admin only" });
    return;
  }
  (req as any).clerkUserId = userId;
  next();
}
