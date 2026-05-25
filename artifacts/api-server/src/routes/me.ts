import { Router } from "express";
import pool from "../lib/db.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Create user_profiles table if not exists
await pool.query(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    clerk_id     TEXT PRIMARY KEY,
    role         TEXT NOT NULL CHECK (role IN ('builder', 'startup', 'company')),
    display_name TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
  )
`);

// ── GET /api/me ───────────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM user_profiles WHERE clerk_id = $1`,
      [clerkId]
    );
    res.json({ profile: rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ── POST /api/me ──────────────────────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  const clerkUser = (req as any).clerkUser;
  const { role } = req.body;

  const validRoles = ["builder", "startup", "company"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const displayName = clerkUser?.fullName || clerkUser?.firstName || null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO user_profiles (clerk_id, role, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (clerk_id) DO UPDATE
         SET role = $2, display_name = $3, updated_at = now()
       RETURNING *`,
      [clerkId, role, displayName]
    );
    res.json({ profile: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to set role" });
  }
});

export default router;
