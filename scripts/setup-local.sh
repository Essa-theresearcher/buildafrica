#!/usr/bin/env bash
# Local setup helper for BuildAfrica
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ BuildAfrica local setup"
echo ""

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "✓ Created .env.local from .env.example"
  echo "  Edit it with your Supabase URL and anon key."
else
  echo "✓ .env.local already exists"
fi

if [[ ! -d node_modules ]]; then
  echo "→ Installing dependencies..."
  npm install
else
  echo "✓ node_modules present"
fi

echo ""
echo "Next steps:"
echo "  1. Create a project at https://supabase.com"
echo "  2. SQL Editor → paste and run supabase/full-setup.sql"
echo "  3. Settings → API → copy URL + anon key into .env.local"
echo "  4. Auth → disable 'Confirm email' for quick local testing"
echo "  5. npm run dev → http://localhost:3000"
echo ""
