# BuildAfrica V1

Proof-of-work showcase platform where African/Somali builders upload real software products, SaaS apps, MVPs, and tools for discovery and contact.

## Tech stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** — dark UI, purple/blue accents
- **Supabase** — Auth, PostgreSQL, Storage (screenshots)

## Quick start

### 1. Install dependencies

```bash
cd buildafrica
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public** key.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 4. Run database setup (one paste)

In the Supabase **SQL Editor**, run the entire file:

**`supabase/full-setup.sql`** — schema only (no demo data)

To remove old demo rows from an existing database, run **`supabase/clear-demo-data.sql`**.

### 5. Auth settings (local dev)

In Supabase **Authentication → Providers → Email**:

- For fastest local testing, you can disable **Confirm email** temporarily so sign-up works immediately.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
buildafrica/
├── src/
│   ├── app/                 # Pages (home, explore, project, builder, auth)
│   ├── components/          # UI, layout, project/builder cards
│   └── lib/                 # Supabase clients, data fetching, actions
├── supabase/
│   ├── schema.sql           # Full DB schema + RLS
│   ├── full-setup.sql       # Same as schema (one-file setup)
│   └── clear-demo-data.sql  # Remove old demo seed from DB
├── .env.example
└── README.md
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero, featured projects, trending builders, activity |
| `/explore` | Search, category filter, sort |
| `/projects/[slug]` | Project detail, likes, views, contact |
| `/builders/[username]` | Builder profile + projects |
| `/projects/new` | Add project (auth required) |
| `/auth/login` | Login |
| `/auth/signup` | Sign up |

## Data model

No demo seed — projects and profiles are created when builders **sign up** and use **Add Project**.

New projects start as **pending** until an admin approves them.

## Admin portal

1. Run **`supabase/admin-migration.sql`** on your database (after `schema.sql` or `full-setup.sql`).
2. Run **`supabase/promote-admin.sql`** with your sign-up email to get `role = admin`.
3. Open **http://localhost:3000/admin**

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard stats |
| `/admin/projects` | Approve, feature, delete projects |
| `/admin/builders` | Roles, suspend users |
| `/admin/featured` | Builder of the Week, featured projects, Launch Friday |
| `/admin/activity` | Moderate activity feed |

New projects start as **pending** until an admin approves them.

## Admin portal

1. Run **`supabase/admin-migration.sql`** on your database (after `schema.sql` or `full-setup.sql`).
2. Run **`supabase/promote-admin.sql`** with your sign-up email to get `role = admin`.
3. Open **http://localhost:3000/admin**

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard stats |
| `/admin/projects` | Approve, feature, delete projects |
| `/admin/builders` | Roles, suspend users |
| `/admin/featured` | Builder of the Week, featured projects, Launch Friday |
| `/admin/activity` | Moderate activity feed |

## V1 scope (intentionally simple)

Included: featured/trending sections, views, likes, activity feed, Build Score placeholder, Builder of the Week & Launch Friday placeholders.

Not included: payments, investor dashboard, AI matching, full social network.

## Screenshots storage

Uploads go to the `screenshots` bucket. Ensure `schema.sql` has been applied so storage policies exist.

## Production build

```bash
npm run build
npm start
```

Requires valid Supabase env vars in `.env.local` (or your host’s env config).

## Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** — import the GitHub repo and add the two `NEXT_PUBLIC_*` env vars.

Quick local setup script:

```bash
chmod +x scripts/setup-local.sh && ./scripts/setup-local.sh
```

## License

Private / project use — adjust as needed.
