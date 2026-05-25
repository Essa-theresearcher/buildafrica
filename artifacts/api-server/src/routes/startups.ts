import { Router } from "express";
import { getAuth } from "@clerk/express";
import pool from "../lib/db.js";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth.js";

const router = Router();

// ── GET /api/startups/stats ──────────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM startups WHERE is_active = true) AS startup_count,
        (SELECT COUNT(DISTINCT builder_clerk_id) FROM startup_team_members) AS builder_count,
        (SELECT COUNT(*) FROM startups WHERE is_active = true AND stage IN ('launched','growing')) AS launched_count
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── GET /api/startups/search?q= ──────────────────────────────────────────────
router.get("/search", async (req, res) => {
  const q = (req.query.q as string || "").trim();
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, tagline, logo_url, category, stage
       FROM startups
       WHERE is_active = true
         AND (name ILIKE $1 OR tagline ILIKE $1)
       ORDER BY name
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json({ startups: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to search startups" });
  }
});

// ── GET /api/startups ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const { stage, category, sort, q } = req.query as Record<string, string>;
  let where = `WHERE s.is_active = true AND s.is_listed = true`;
  const params: unknown[] = [];
  let pi = 1;

  if (stage && stage !== "all") {
    where += ` AND s.stage = $${pi++}`;
    params.push(stage);
  }
  if (category && category !== "all") {
    where += ` AND s.category = $${pi++}`;
    params.push(category);
  }
  if (q) {
    where += ` AND (s.name ILIKE $${pi} OR s.tagline ILIKE $${pi} OR s.description ILIKE $${pi})`;
    params.push(`%${q}%`);
    pi++;
  }

  const orderMap: Record<string, string> = {
    newest: "s.created_at DESC",
    most_upvoted: "s.total_upvotes DESC",
    most_viewed: "s.total_views DESC",
    recently_updated: "s.updated_at DESC",
    hiring: "s.is_hiring DESC, s.created_at DESC",
  };
  const orderBy = orderMap[sort] || "s.created_at DESC";

  try {
    const { rows } = await pool.query(
      `SELECT s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'builder_clerk_id', m.builder_clerk_id,
              'builder_name', m.builder_name,
              'builder_avatar_url', m.builder_avatar_url,
              'role', m.role,
              'is_founder', m.is_founder
            ) ORDER BY m.is_founder DESC, m.joined_at ASC
          ) FILTER (WHERE m.id IS NOT NULL), '[]'
        ) AS team_members,
        (SELECT MAX(su.created_at) FROM startup_updates su WHERE su.startup_id = s.id) AS last_update_at
       FROM startups s
       LEFT JOIN startup_team_members m ON m.startup_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY ${orderBy}`,
      params
    );
    res.json({ startups: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch startups" });
  }
});

// ── GET /api/startups/:slug ──────────────────────────────────────────────────
router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'builder_clerk_id', m.builder_clerk_id,
              'builder_name', m.builder_name,
              'builder_avatar_url', m.builder_avatar_url,
              'role', m.role,
              'is_founder', m.is_founder
            ) ORDER BY m.is_founder DESC, m.joined_at ASC
          ) FILTER (WHERE m.id IS NOT NULL), '[]'
        ) AS team_members
       FROM startups s
       LEFT JOIN startup_team_members m ON m.startup_id = s.id
       WHERE s.slug = $1
       GROUP BY s.id`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Startup not found" });
      return;
    }
    res.json({ startup: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch startup" });
  }
});

// ── POST /api/startups ───────────────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  const clerkUser = (req as any).clerkUser;
  const {
    name, slug, tagline, description, problem_solved, category, stage,
    logo_url, cover_image_url, demo_url, product_url, github_url,
    looking_for, traction_users, traction_revenue, markets_served, is_hiring,
  } = req.body;

  if (!name || !slug || !tagline || !description || !problem_solved || !category || !stage) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Check slug uniqueness
    const existing = await pool.query(`SELECT id FROM startups WHERE slug = $1`, [slug]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "Slug already taken" });
      return;
    }
    // Check user doesn't already have a startup
    const mine = await pool.query(`SELECT id, slug FROM startups WHERE founder_clerk_id = $1 AND is_active = true`, [clerkId]);
    if (mine.rows.length > 0) {
      res.status(409).json({ error: "You already have a startup", startup: mine.rows[0] });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO startups (
        founder_clerk_id, name, slug, tagline, description, problem_solved,
        category, stage, logo_url, cover_image_url, demo_url, product_url,
        github_url, looking_for, traction_users, traction_revenue,
        markets_served, is_hiring
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        clerkId, name, slug, tagline, description, problem_solved,
        category, stage, logo_url || null, cover_image_url || null,
        demo_url || null, product_url || null, github_url || null,
        looking_for ? JSON.stringify(looking_for) : null,
        traction_users || null, traction_revenue || null,
        markets_served ? markets_served : null, is_hiring || false,
      ]
    );
    const startup = rows[0];

    // Insert founder as first team member
    const founderName = clerkUser?.fullName || clerkUser?.firstName || "Founder";
    await pool.query(
      `INSERT INTO startup_team_members (startup_id, builder_clerk_id, builder_name, builder_avatar_url, role, is_founder)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [startup.id, clerkId, founderName, clerkUser?.imageUrl || null, "Founder"]
    );

    res.status(201).json({ startup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create startup" });
  }
});

// ── POST /api/startups/check-slug ────────────────────────────────────────────
router.post("/check-slug", async (req, res) => {
  const { slug } = req.body;
  if (!slug) { res.status(400).json({ error: "Slug required" }); return; }
  try {
    const { rows } = await pool.query(`SELECT id FROM startups WHERE slug = $1`, [slug]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to check slug" });
  }
});

// ── GET /api/startups/my/startup ─────────────────────────────────────────────
router.get("/my/startup", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, name FROM startups WHERE founder_clerk_id = $1 AND is_active = true LIMIT 1`,
      [clerkId]
    );
    res.json({ startup: rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch startup" });
  }
});

// ── POST /api/startups/:id/view ──────────────────────────────────────────────
router.post("/:id/view", async (req, res) => {
  const auth = getAuth(req);
  const clerkId = auth?.userId || null;
  try {
    await pool.query(
      `INSERT INTO startup_views (startup_id, viewer_clerk_id) VALUES ($1, $2)`,
      [req.params.id, clerkId]
    );
    await pool.query(
      `UPDATE startups SET total_views = total_views + 1 WHERE id = $1`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record view" });
  }
});

// ── POST /api/startups/:id/upvote ────────────────────────────────────────────
router.post("/:id/upvote", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  try {
    const existing = await pool.query(
      `SELECT id FROM startup_upvotes WHERE startup_id = $1 AND user_clerk_id = $2`,
      [req.params.id, clerkId]
    );
    if (existing.rows.length > 0) {
      // Remove upvote
      await pool.query(`DELETE FROM startup_upvotes WHERE startup_id = $1 AND user_clerk_id = $2`, [req.params.id, clerkId]);
      await pool.query(`UPDATE startups SET total_upvotes = GREATEST(0, total_upvotes - 1) WHERE id = $1`, [req.params.id]);
      res.json({ upvoted: false });
    } else {
      await pool.query(`INSERT INTO startup_upvotes (startup_id, user_clerk_id) VALUES ($1, $2)`, [req.params.id, clerkId]);
      await pool.query(`UPDATE startups SET total_upvotes = total_upvotes + 1 WHERE id = $1`, [req.params.id]);
      res.json({ upvoted: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle upvote" });
  }
});

// ── GET /api/startups/:id/upvote-status ──────────────────────────────────────
router.get("/:id/upvote-status", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  try {
    const { rows } = await pool.query(
      `SELECT id FROM startup_upvotes WHERE startup_id = $1 AND user_clerk_id = $2`,
      [req.params.id, clerkId]
    );
    res.json({ upvoted: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to check upvote status" });
  }
});

// ── GET /api/startups/:id/updates ────────────────────────────────────────────
router.get("/:id/updates", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM startup_updates WHERE startup_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ updates: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

// ── POST /api/startups/:id/updates ───────────────────────────────────────────
router.post("/:id/updates", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  const clerkUser = (req as any).clerkUser;
  const { title, body, update_type } = req.body;

  const validTypes = ["shipped", "milestone", "setback", "looking_for", "general"];
  if (!title || !body || !validTypes.includes(update_type)) {
    res.status(400).json({ error: "Missing or invalid fields" });
    return;
  }
  if (body.length < 50 || body.length > 1000) {
    res.status(400).json({ error: "Body must be 50–1000 characters" });
    return;
  }

  try {
    // Verify requester is the founder
    const { rows: startup } = await pool.query(
      `SELECT id FROM startups WHERE id = $1 AND founder_clerk_id = $2`,
      [req.params.id, clerkId]
    );
    if (startup.length === 0) {
      res.status(403).json({ error: "Only the founder can post updates" });
      return;
    }

    const founderName = clerkUser?.fullName || clerkUser?.firstName || "Founder";
    const { rows } = await pool.query(
      `INSERT INTO startup_updates (startup_id, posted_by_clerk_id, posted_by_name, posted_by_avatar_url, title, body, update_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.id, clerkId, founderName, clerkUser?.imageUrl || null, title, body, update_type]
    );
    await pool.query(`UPDATE startups SET updated_at = now() WHERE id = $1`, [req.params.id]);
    res.status(201).json({ update: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to post update" });
  }
});

export default router;
