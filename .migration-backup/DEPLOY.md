# Deploy BuildAfrica

## Vercel (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import:
   **https://github.com/Essa-theresearcher/buildafrica**

2. Framework preset: **Next.js** (auto-detected)

3. **Environment variables** (Production + Preview):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon public key |

4. Deploy.

5. In **Supabase → Authentication → URL configuration**:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** add `https://your-app.vercel.app/**`

6. Re-run `supabase/full-setup.sql` if the production DB is empty.

## After deploy

- Test sign-up and add-project on the live URL
- Turn **Confirm email** back on in Supabase for production
- Share the link with builders
