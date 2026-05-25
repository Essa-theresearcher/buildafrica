# BuildHub

BuildHub is a trusted builder discovery platform that helps developers prove execution through shipped projects and verified profiles, and helps companies find reliable builders from a trusted community.

## Run & Operate

- `pnpm --filter @workspace/buildhub run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter routing
- Styling: Tailwind CSS v4 (dark theme, purple/blue gradient)
- API: Express 5 (in artifacts/api-server, not yet wired to frontend)
- DB: PostgreSQL + Drizzle ORM (not yet used — MVP uses in-memory seed data)

## Where things live

- `artifacts/buildhub/` — main web app (BuildHub MVP)
- `artifacts/buildhub/src/data/seed.ts` — dummy seed data (6 Nairobi builders, 6 projects, 3 company requests)
- `artifacts/buildhub/src/types.ts` — TypeScript types
- `artifacts/buildhub/src/pages/` — all 6 page components
- `artifacts/buildhub/src/components/` — layout and shared components
- `artifacts/api-server/` — backend (scaffold, not yet wired to frontend)
- `lib/db/` — Drizzle schema (empty, ready to populate)

## Pages

- `/` — Home/Landing
- `/builders` — Builders Directory (search, filter by availability/verified)
- `/builders/:username` — Builder Profile
- `/projects` — Projects showcase (search, filter by status)
- `/request` — Company Request form
- `/admin` — Admin Dashboard (verify builders, match companies, add notes)

## Architecture decisions

- MVP uses in-memory seed data only — no backend/DB calls yet
- Wouter used for routing (already in scaffold, lightweight)
- All styling via custom CSS variables + Tailwind utilities (no component library)
- Reputation tags are the core signal: Verified Builder, Shipped Project, Reliable Collaborator, Available for Work, Coffee & Code Member
- Dark-only design (no light mode) — serious/professional aesthetic

## Product

BuildHub rewards proof of work, not self-promotion. Every signal answers: "Can this person actually build and deliver reliably?" Core features: builder profiles with verification, project showcase with contribution details, company request matching, and admin tools.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root — use `pnpm --filter @workspace/buildhub run dev`
- The app is purely frontend for now — no backend calls, all data is from seed.ts
- To add real persistence, connect seed data to the api-server + lib/db stack

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
