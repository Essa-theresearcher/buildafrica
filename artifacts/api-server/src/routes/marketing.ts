import { Router } from "express";
import pool from "../lib/db.js";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth.js";

const router = Router();

// ── GET /api/marketing/packages ──────────────────────────────────────────────
router.get("/packages", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM marketing_packages WHERE is_active = true ORDER BY sort_order ASC`
    );
    res.json({ packages: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// ── POST /api/marketing/waitlist ─────────────────────────────────────────────
router.post("/waitlist", async (req, res) => {
  const { email, startup_id, startup_name, package_interest, message } = req.body;
  if (!email || !package_interest) {
    res.status(400).json({ error: "Email and package_interest are required" });
    return;
  }
  const validPackages = ["featured", "spotlight", "startup_of_week", "premium"];
  if (!validPackages.includes(package_interest)) {
    res.status(400).json({ error: "Invalid package_interest" });
    return;
  }
  try {
    await pool.query(
      `INSERT INTO marketing_waitlist (email, startup_id, startup_name, package_interest, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, startup_id || null, startup_name || null, package_interest, message || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to join waitlist" });
  }
});

// ── GET /api/marketing/admin/waitlist ────────────────────────────────────────
router.get("/admin/waitlist", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mw.*, s.name AS startup_name_actual
       FROM marketing_waitlist mw
       LEFT JOIN startups s ON s.id = mw.startup_id
       ORDER BY mw.created_at DESC`
    );
    res.json({ waitlist: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch waitlist" });
  }
});

// ── GET /api/marketing/admin/active ──────────────────────────────────────────
router.get("/admin/active", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, marketing_tier, is_featured, featured_until,
              is_spotlight, spotlight_until, is_startup_of_week, startup_of_week_date
       FROM startups
       WHERE is_active = true
         AND (is_featured = true OR is_spotlight = true OR is_startup_of_week = true)
       ORDER BY updated_at DESC`
    );
    res.json({ promotions: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch active promotions" });
  }
});

// ── POST /api/marketing/admin/remove-promotion ───────────────────────────────
router.post("/admin/remove-promotion", requireAdmin, async (req, res) => {
  const { startup_id } = req.body;
  if (!startup_id) { res.status(400).json({ error: "startup_id required" }); return; }
  try {
    await pool.query(
      `UPDATE startups SET
        is_featured = false, featured_until = null,
        is_spotlight = false, spotlight_until = null,
        is_startup_of_week = false, startup_of_week_date = null,
        is_boosted = false, boosted_until = null,
        marketing_tier = 'free', updated_at = now()
       WHERE id = $1`,
      [startup_id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove promotion" });
  }
});

// ── POST /api/marketing/admin/set-startup-of-week ────────────────────────────
router.post("/admin/set-startup-of-week", requireAdmin, async (req, res) => {
  const { startup_id } = req.body;
  if (!startup_id) { res.status(400).json({ error: "startup_id required" }); return; }
  try {
    // Reset any existing startup_of_week
    await pool.query(
      `UPDATE startups SET is_startup_of_week = false, startup_of_week_date = null WHERE is_startup_of_week = true`
    );
    // Set new one
    await pool.query(
      `UPDATE startups SET
        is_startup_of_week = true,
        startup_of_week_date = CURRENT_DATE,
        is_featured = true,
        featured_until = now() + interval '7 days',
        marketing_tier = 'spotlight',
        updated_at = now()
       WHERE id = $1`,
      [startup_id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to set startup of week" });
  }
});

// ── POST /api/marketing/admin/manual-feature ─────────────────────────────────
router.post("/admin/manual-feature", requireAdmin, async (req, res) => {
  const { startup_id, package_slug, featured_until } = req.body;
  if (!startup_id || !package_slug || !featured_until) {
    res.status(400).json({ error: "startup_id, package_slug, featured_until required" });
    return;
  }
  try {
    const tierMap: Record<string, string> = { featured: "featured", spotlight: "spotlight", premium: "premium" };
    const tier = tierMap[package_slug] || "featured";
    await pool.query(
      `UPDATE startups SET
        is_featured = true,
        featured_until = $2,
        is_spotlight = $3,
        spotlight_until = CASE WHEN $3 THEN $2::timestamptz ELSE spotlight_until END,
        marketing_tier = $4,
        updated_at = now()
       WHERE id = $1`,
      [startup_id, featured_until, package_slug === "spotlight" || package_slug === "premium", tier]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to manually feature startup" });
  }
});

export default router;
