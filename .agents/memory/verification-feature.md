---
name: Verification feature
description: Full verification flow — DB schema, API routes, frontend pages
---

## Database tables (all in PostgreSQL)
- verification_applications — one per builder, tracks full lifecycle
- challenges — 6 seeded challenges (2 frontend, 2 backend, 1 fullstack, 1 mobile)
- builder_badges — granted on pass/conditional_pass
- admin_call_checklist — 8-item checklist filled by admin after live call

## Verification lifecycle (status column)
pending → challenge_assigned → submitted → call_scheduled → passed|failed|conditional_pass

## API routes (all under /api/verify/)
- GET  /status          — builder's current application + challenge details
- POST /apply           — start application (requires primary_skill)
- POST /submit          — submit github_url, demo_url, explanation, screenshot_url
- GET  /challenges      — list active challenges (filter by ?skill=)
- GET  /badge/:clerkId  — public badge lookup
- GET  /admin/all       — all applications (admin only, filter by ?status=)
- POST /admin/assign-challenge — assign challenge_id to pending application
- POST /admin/schedule-call   — set call_scheduled_at on submitted application
- POST /admin/decide          — record pass/fail/conditional_pass + checklist + badge

## Frontend pages
- /verify       → VerifyApply.tsx — skill selector + process steps + sign-in gate
- /verify/status → VerifyStatus.tsx — step tracker + challenge display + submission form + countdown
- /admin/verifications → AdminVerifications.tsx — admin dashboard, assign/schedule/decide modals

## Admin access
- requireAdmin middleware checks ADMIN_CLERK_IDS env var (comma-separated Clerk user IDs)
- Frontend AdminVerifications also checks VITE_ADMIN_CLERK_IDS env var for UI-level gating

## Auth
- requireAuth checks getAuth(req).userId from @clerk/express
- Web app uses cookie-based auth (no Bearer token needed)
- Vite proxies /api/* to port 8080 so cookies work same-origin in dev
