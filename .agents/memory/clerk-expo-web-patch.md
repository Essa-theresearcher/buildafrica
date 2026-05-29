---
name: Clerk Expo web preview crash patch
description: Why patches/@clerk__react@5.54.0.patch exists and when it can be removed
---

# @clerk/expo web preview crash

`@clerk/expo@2.19.0` (the only published 2.x) hard-depends on `@clerk/react@5.54.0`
(the only 5.x of the renamed `@clerk/react` package). On **web** (the Replit Expo
preview pane), `@clerk/react@5.54.0` calls `loadClerkUiScript()` — a symbol that does
NOT exist in any published `@clerk/shared` (checked 3.47.7 latest 3.x, and 4.13.1).
Result: Expo web preview crashes with `loadClerkUiScript is not a function`.

**Fix:** a scoped pnpm patch (`patches/@clerk__react@5.54.0.patch`, registered under
`pnpm.patchedDependencies` in root package.json) makes `loadClerkUiEntryChunk` a safe
no-op (returns undefined) when `loadClerkUiScript` is missing. Both `dist/index.js`
(CJS) and `dist/index.mjs` (ESM — Metro uses this) must be patched.

**Why safe:** the buildhub-mobile app uses 100% custom Clerk UI (useSignIn/useSignUp/
useSSO hooks), so the "Clerk UI" remote chunk is never needed. Native runtime never
calls this path. ClerkJS handles `clerkUiCtor: undefined` fine.

**How to apply / sunset:** keep the patch until a `@clerk/expo` release lands whose
`@clerk/react` + `@clerk/shared` are mutually compatible (i.e. shared actually exports
`loadClerkUiScript`, or react stops calling it). Then delete the patch + the
patchedDependencies entry and reinstall. Verify by loading the Expo web preview and
confirming Clerk loads with no console crash.
