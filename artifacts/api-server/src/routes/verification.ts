import { Router } from "express";
import pool from "../lib/db.js";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth.js";

const router = Router();

// ── GET /api/verify/status ───────────────────────────────────────────────────
// Returns the current builder's application, joined with challenge details
router.get("/status", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  try {
    const { rows } = await pool.query(
      `SELECT va.*, c.title AS challenge_title, c.description AS challenge_description,
              c.requirements AS challenge_requirements, c.local_context AS challenge_local_context,
              c.time_limit_hours AS challenge_time_limit_hours
       FROM verification_applications va
       LEFT JOIN challenges c ON c.id = va.challenge_id
       WHERE va.builder_clerk_id = $1
       ORDER BY va.created_at DESC
       LIMIT 1`,
      [clerkId]
    );
    if (rows.length === 0) {
      res.json({ application: null });
      return;
    }
    res.json({ application: rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// ── POST /api/verify/apply ───────────────────────────────────────────────────
// Start a new verification application
router.post("/apply", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  const { primary_skill } = req.body;

  const validSkills = ["frontend", "backend", "fullstack", "mobile", "data", "devops"];
  if (!validSkills.includes(primary_skill)) {
    res.status(400).json({ error: "Invalid primary_skill value" });
    return;
  }

  try {
    // Check no active application already exists
    const existing = await pool.query(
      `SELECT id, status FROM verification_applications
       WHERE builder_clerk_id = $1
         AND status NOT IN ('passed', 'failed')
       LIMIT 1`,
      [clerkId]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "You already have an active application", application: existing.rows[0] });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO verification_applications (builder_clerk_id, primary_skill, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [clerkId, primary_skill]
    );
    res.status(201).json({ application: rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to create application" });
  }
});

// ── POST /api/verify/submit ──────────────────────────────────────────────────
// Builder submits their challenge work
router.post("/submit", requireAuth, async (req, res) => {
  const clerkId = (req as any).clerkUserId;
  const { github_url, demo_url, explanation, screenshot_url } = req.body;

  // Validate
  if (!github_url?.startsWith("https://github.com/")) {
    res.status(400).json({ error: "GitHub URL must start with https://github.com/" });
    return;
  }
  if (!demo_url?.startsWith("https://")) {
    res.status(400).json({ error: "Demo URL must start with https://" });
    return;
  }
  if (!explanation || explanation.length < 150 || explanation.length > 500) {
    res.status(400).json({ error: "Explanation must be between 150 and 500 characters" });
    return;
  }

  try {
    const appResult = await pool.query(
      `SELECT id, status, challenge_deadline FROM verification_applications
       WHERE builder_clerk_id = $1
         AND status = 'challenge_assigned'
       ORDER BY created_at DESC LIMIT 1`,
      [clerkId]
    );
    if (appResult.rows.length === 0) {
      res.status(404).json({ error: "No active challenge found for submission" });
      return;
    }
    const app = appResult.rows[0];
    if (new Date() > new Date(app.challenge_deadline)) {
      res.status(400).json({ error: "Challenge deadline has passed" });
      return;
    }

    const { rows } = await pool.query(
      `UPDATE verification_applications
       SET submission_github_url = $1,
           submission_demo_url = $2,
           submission_explanation = $3,
           submission_screenshot_url = $4,
           submitted_at = NOW(),
           status = 'submitted'
       WHERE id = $5
       RETURNING *`,
      [github_url, demo_url, explanation, screenshot_url || null, app.id]
    );
    res.json({ application: rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// ── GET /api/verify/challenges ───────────────────────────────────────────────
// Fetch all active challenges (for admin challenge assignment modal)
router.get("/challenges", requireAuth, async (req, res) => {
  const { skill } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM challenges WHERE is_active = TRUE ${skill ? "AND skill_category = $1" : ""}
       ORDER BY created_at`,
      skill ? [skill] : []
    );
    res.json({ challenges: rows });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// ── ADMIN: GET /api/admin/verifications ─────────────────────────────────────
router.get("/admin/all", requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT va.*, c.title AS challenge_title, c.skill_category AS challenge_skill
       FROM verification_applications va
       LEFT JOIN challenges c ON c.id = va.challenge_id
       ${status && status !== "all" ? "WHERE va.status = $1" : ""}
       ORDER BY va.created_at DESC`,
      status && status !== "all" ? [status] : []
    );
    res.json({ applications: rows });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ── ADMIN: POST /api/verify/admin/assign-challenge ───────────────────────────
router.post("/admin/assign-challenge", requireAdmin, async (req, res) => {
  const { application_id, challenge_id } = req.body;
  if (!application_id || !challenge_id) {
    res.status(400).json({ error: "application_id and challenge_id are required" });
    return;
  }
  try {
    const { rows } = await pool.query(
      `UPDATE verification_applications
       SET challenge_id = $1,
           status = 'challenge_assigned',
           challenge_assigned_at = NOW(),
           challenge_deadline = NOW() + INTERVAL '72 hours'
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [challenge_id, application_id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Application not found or not in pending status" });
      return;
    }
    res.json({ application: rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to assign challenge" });
  }
});

// ── ADMIN: POST /api/verify/admin/schedule-call ──────────────────────────────
router.post("/admin/schedule-call", requireAdmin, async (req, res) => {
  const { application_id, call_scheduled_at } = req.body;
  if (!application_id || !call_scheduled_at) {
    res.status(400).json({ error: "application_id and call_scheduled_at are required" });
    return;
  }
  try {
    const { rows } = await pool.query(
      `UPDATE verification_applications
       SET call_scheduled_at = $1, status = 'call_scheduled'
       WHERE id = $2 AND status = 'submitted'
       RETURNING *`,
      [call_scheduled_at, application_id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Application not found or not in submitted status" });
      return;
    }
    res.json({ application: rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to schedule call" });
  }
});

// ── ADMIN: POST /api/verify/admin/decide ─────────────────────────────────────
router.post("/admin/decide", requireAdmin, async (req, res) => {
  const adminClerkId = (req as any).clerkUserId;
  const { application_id, decision, admin_notes, badge_scope, checklist } = req.body;

  const validDecisions = ["passed", "failed", "conditional_pass"];
  if (!validDecisions.includes(decision)) {
    res.status(400).json({ error: "decision must be passed, failed, or conditional_pass" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const appResult = await client.query(
      `UPDATE verification_applications
       SET status = $1, admin_notes = $2, decision_made_at = NOW(), call_completed_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [decision, admin_notes || null, application_id]
    );
    if (appResult.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const app = appResult.rows[0];

    // Save checklist if provided
    if (checklist) {
      await client.query(
        `INSERT INTO admin_call_checklist
         (application_id, can_demo_without_hesitation, can_explain_approach,
          answered_unexpected_questions, made_live_change, commit_history_real,
          has_other_projects, knows_community, gut_feeling_pass, admin_clerk_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          application_id,
          checklist.can_demo_without_hesitation ?? false,
          checklist.can_explain_approach ?? false,
          checklist.answered_unexpected_questions ?? false,
          checklist.made_live_change ?? false,
          checklist.commit_history_real ?? false,
          checklist.has_other_projects ?? false,
          checklist.knows_community ?? false,
          checklist.gut_feeling_pass ?? false,
          adminClerkId,
        ]
      );
    }

    // Grant badge if passed
    if (decision === "passed" || decision === "conditional_pass") {
      await client.query(
        `INSERT INTO builder_badges (builder_clerk_id, badge_type, badge_scope, granted_by_clerk_id)
         VALUES ($1, 'verified_builder', $2, $3)`,
        [app.builder_clerk_id, badge_scope || null, adminClerkId]
      );
    }

    await client.query("COMMIT");
    res.json({ application: app });
  } catch (err) {
    await client.query("ROLLBACK");
    req.log?.error(err);
    res.status(500).json({ error: "Failed to record decision" });
  } finally {
    client.release();
  }
});

// ── GET /api/verify/badge ────────────────────────────────────────────────────
// Public: check if a clerk user has a verified badge
router.get("/badge/:clerkId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM builder_badges WHERE builder_clerk_id = $1 AND is_active = TRUE`,
      [req.params.clerkId]
    );
    res.json({ badges: rows });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

export default router;
