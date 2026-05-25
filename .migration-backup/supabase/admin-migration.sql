-- BuildAfrica Admin Portal migration
-- Run in Supabase SQL Editor on an existing database.

-- Profiles: role, active, builder of week
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  add column if not exists is_active boolean not null default true,
  add column if not exists is_builder_of_week boolean not null default false;

-- Projects: moderation status
alter table public.projects
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists rejection_reason text;

create index if not exists projects_status_idx on public.projects (status);

-- Existing projects go live (skip re-moderation)
update public.projects set status = 'approved' where status = 'pending';

-- Site-wide settings (Launch Friday banner, etc.)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now() not null
);

alter table public.site_settings enable row level security;

insert into public.site_settings (key, value)
values
  ('launch_friday', '{"enabled": false, "title": "Launch Friday", "message": "Batch your launches for maximum visibility."}'::jsonb)
on conflict (key) do nothing;

-- Admin helper (security definer)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- Views only count approved projects
create or replace function public.increment_project_views(project_slug text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.projects
  set views = views + 1
  where slug = project_slug and status = 'approved';
end;
$$;

-- Drop old permissive policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Projects are viewable by everyone" on public.projects;
drop policy if exists "Authenticated users can create projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;
drop policy if exists "Activity is viewable by everyone" on public.activity;
drop policy if exists "Authenticated users can create activity" on public.activity;

-- Profiles RLS
create policy "Public profiles are viewable"
  on public.profiles for select
  using (is_active = true or auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Projects RLS
create policy "Public approved projects are viewable"
  on public.projects for select
  using (
    (status = 'approved' and exists (
      select 1 from public.profiles p
      where p.id = projects.user_id and p.is_active = true
    ))
    or auth.uid() = user_id
    or public.is_admin()
  );

create policy "Active users can create projects"
  on public.projects for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_active = true
    )
  );

create policy "Users can update own pending projects"
  on public.projects for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Users or admins can delete projects"
  on public.projects for delete
  using (auth.uid() = user_id or public.is_admin());

-- Activity RLS
create policy "Public activity is viewable"
  on public.activity for select
  using (true);

create policy "Authenticated users can create activity"
  on public.activity for insert
  with check (auth.uid() = user_id);

create policy "Admins can delete activity"
  on public.activity for delete
  using (public.is_admin());

-- Site settings RLS
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Promote yourself: replace with your auth user email
-- update public.profiles set role = 'admin' where email = 'you@example.com';
