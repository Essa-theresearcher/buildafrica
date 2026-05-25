---
name: Clerk setup
description: How Clerk is wired in BuildHub — key gotchas for future sessions
---

## Setup
- Clerk provisioned (managed), app_3EDOrBE5nE0eazUDQCiPLIB6MJN
- 3 env vars set: CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, VITE_CLERK_PUBLISHABLE_KEY
- clerkProxyMiddleware copied to artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts
- @clerk/express + @clerk/shared installed on api-server
- @clerk/react + @clerk/themes installed on buildhub frontend

## Critical: Circular import fix
ThemeContext and useTheme MUST live in `artifacts/buildhub/src/lib/theme.ts` — NOT in App.tsx.
App.tsx imports Navbar, Navbar used to import useTheme from App — circular. Fix: lib/theme.ts.

**Why:** Vite HMR breaks on circular imports with a hard reload and errors. Extracting to lib/theme.ts eliminates the cycle permanently.

## Clerk appearance
- Uses shadcn theme from @clerk/themes
- cssLayerName: "clerk" (required for Tailwind v4 layer ordering)
- Logo at artifacts/buildhub/public/logo.svg (purple gradient B icon)
- Sign-in/sign-up pages: full-screen centered, no Navbar/Footer

## Route pattern
- Routes use `path="/sign-in/*?"` and `path="/sign-up/*?"` — the /*? wildcard is mandatory for Clerk OAuth sub-paths
- basePath = import.meta.env.BASE_URL.replace(/\/$/, "")
- stripBase() strips the base prefix before calling setLocation() (prevents double-prefix)
