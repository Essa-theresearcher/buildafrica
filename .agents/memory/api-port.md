---
name: API server port
description: Port assignments for BuildHub's two servers
---

## Ports
- API server (api-server): PORT=8080
- Frontend (buildhub): PORT=23105, externalPort=80

## API calls from frontend
- Frontend api.ts uses API_BASE = "" (empty string)
- Vite proxies `/api/*` → `http://localhost:8080` in dev (set in vite.config.ts server.proxy)
- In prod, same-origin routing handles it

**Why:** The API server uses $PORT env var assigned by Replit, which is 8080. Hardcoding 5000 in the frontend would fail. Empty API_BASE + Vite proxy is the correct pattern.
