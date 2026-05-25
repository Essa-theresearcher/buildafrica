# BuildHub

BuildHub is a trusted builder discovery platform that helps developers prove execution through shipped projects and verified profiles, and helps companies find reliable builders from a trusted community.

## Run & Operate

- `pnpm --filter @workspace/buildhub run dev` — run the frontend (port 23105, proxied to :80)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter routing + Clerk auth
- Styling: Tailwind CSS v4 (light/dark themes, purple/blue gradient)
- API: Express 5 + Clerk middleware (port 8080)
- DB: PostgreSQL (live) — verification tables active, seed data for builders/projects in-memory
- Auth: Clerk (Replit-managed, app_3EDOrBE5nE0eazUDQCiPLIB6MJN)

## Where things live

- `artifacts/buildhub/` — main web app
- `artifacts/buildhub/src/lib/theme.ts` — ThemeContext + useTheme (extracted to avoid circular import)
- `artifacts/buildhub/src/lib/api.ts` — apiFetch helper (uses Vite proxy, API_BASE = "")
- `artifacts/buildhub/src/data/seed.ts` — 6 East African builders, 6 projects, 3 company requests
- `artifacts/buildhub/src/types.ts` — TypeScript types
- `artifacts/buildhub/src/pages/` — all page components (9 pages)
- `artifacts/buildhub/src/components/` — layout and shared components
- `artifacts/api-server/` — Express API server with Clerk middleware
- `artifacts/api-server/src/lib/db.ts` — pg Pool connected to DATABASE_URL
- `artifacts/api-server/src/routes/verification.ts` — all 9 verification/admin API routes
- `artifacts/api-server/src/middlewares/requireAuth.ts` — requireAuth + requireAdmin
- `lib/db/` — Drizzle schema (schema/index.ts currently empty; DB tables created via raw SQL)

## Pages

- `/` — Home/Landing (redirects signed-in users to /builders)
- `/sign-in` — Clerk branded sign-in
- `/sign-up` — Clerk branded sign-up
- `/builders` — Builders Directory (search, filter by availability/verified)
- `/builders/:username` — Builder Profile
- `/projects` — Projects showcase (search, filter by status)
- `/request` — Company Request form
- `/admin` — Admin Dashboard (seed-data admin tools)
- `/admin/verifications` — Live admin verification queue (requires ADMIN_CLERK_IDS)
- `/verify` — Apply for verification (requires sign-in)
- `/verify/status` — Track application, view challenge, submit work

## Architecture decisions

- Frontend pages use in-memory seed data; verification feature uses real PostgreSQL
- Wouter routing with base path from BASE_URL env var
- ThemeContext lives in lib/theme.ts (NOT App.tsx) to avoid circular import with Navbar
- Vite proxies /api/* → port 8080 in dev; same-origin in prod
- Clerk uses cookie-based auth for web (no Bearer token in browser requests)
- Admin identified by ADMIN_CLERK_IDS env var (comma-separated Clerk user IDs)
- Reputation tags: Verified Builder, Shipped Project, Reliable Collaborator, Available for Work, Coffee & Code Member

## Verification feature (live end-to-end)

Flow: Apply → Admin assigns 72h challenge → Builder submits → Admin schedules call → Admin records decision → Badge granted

DB tables: verification_applications, challenges (6 seeded), builder_badges, admin_call_checklist

To make yourself admin: set ADMIN_CLERK_IDS secret to your Clerk user ID (find it in Clerk dashboard or from getAuth(req).userId).

## Product

BuildHub rewards proof of work, not self-promotion. Every signal answers: "Can this person actually build and deliver reliably?" Core features: builder profiles with verification, project showcase with contribution details, company request matching, and admin tools.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root — use `pnpm --filter @workspace/buildhub run dev`
- API server port is 8080 (assigned by $PORT), NOT 5000
- ThemeContext/useTheme must stay in lib/theme.ts — importing from App.tsx causes circular imports
- Vite proxy in vite.config.ts routes /api/* to localhost:8080 in dev
- Clerk: cssLayerName "clerk" requires `@layer theme, base, clerk, components, utilities` before @import "tailwindcss" in index.css

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
