-- Remove all demo seed data from your Supabase database
-- Run in SQL Editor. Safe to re-run.
-- Keeps real users who signed up via Auth (profiles linked to auth.users).

-- Demo IDs from the old seed.sql
delete from public.likes
where project_id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);

delete from public.activity
where user_id::text like '11111111-1111-1111-1111-%'
   or project_id::text like '22222222-2222-2222-2222-%';

delete from public.projects
where id::text like '22222222-2222-2222-2222-%';

delete from public.profiles
where id::text like '11111111-1111-1111-1111-%';
