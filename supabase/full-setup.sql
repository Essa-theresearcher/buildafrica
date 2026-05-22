-- BuildAfrica: initial database setup (schema only, no demo data)
-- Paste and run once in Supabase SQL Editor.

-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type project_category as enum (
  'SaaS',
  'AI',
  'Inventory',
  'Education',
  'Fintech',
  'Health',
  'Logistics',
  'Developer Tools',
  'Other'
);

create type activity_type as enum (
  'project_launched',
  'project_liked',
  'builder_joined'
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  username text unique not null,
  avatar_url text,
  bio text default '',
  location text default '',
  skills text[] default '{}',
  whatsapp text,
  email text,
  social_links jsonb default '{}',
  build_score integer default 0,
  created_at timestamptz default now() not null
);

create index profiles_username_idx on public.profiles (username);

-- Projects
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text unique not null,
  short_description text not null,
  problem_solved text not null default '',
  category project_category not null default 'Other',
  tech_stack text[] default '{}',
  demo_url text,
  github_url text,
  contact_email text not null,
  whatsapp text,
  screenshots text[] default '{}',
  views integer default 0 not null,
  likes integer default 0 not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null
);

create index projects_user_id_idx on public.projects (user_id);
create index projects_category_idx on public.projects (category);
create index projects_created_at_idx on public.projects (created_at desc);
create index projects_likes_idx on public.projects (likes desc);
create index projects_views_idx on public.projects (views desc);

-- Likes (one per user per project)
create table public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz default now() not null,
  unique (user_id, project_id)
);

create index likes_project_id_idx on public.likes (project_id);

-- Activity feed
create table public.activity (
  id uuid primary key default uuid_generate_v4(),
  type activity_type not null,
  user_id uuid references public.profiles (id) on delete set null,
  project_id uuid references public.projects (id) on delete cascade,
  message text not null,
  created_at timestamptz default now() not null
);

create index activity_created_at_idx on public.activity (created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(split_part(new.email, '@', 1), 'builder'),
    '[^a-z0-9]', '', 'g'
  ));
  if base_username = '' then
    base_username := 'builder';
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, full_name, username, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    final_username,
    new.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || final_username
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sync likes count on projects
create or replace function public.sync_project_likes_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.projects set likes = likes + 1 where id = new.project_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.projects set likes = greatest(likes - 1, 0) where id = old.project_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger likes_count_insert
  after insert on public.likes
  for each row execute function public.sync_project_likes_count();

create trigger likes_count_delete
  after delete on public.likes
  for each row execute function public.sync_project_likes_count();

-- Increment project views (callable from app)
create or replace function public.increment_project_views(project_slug text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.projects
  set views = views + 1
  where slug = project_slug;
end;
$$;

grant execute on function public.increment_project_views(text) to anon, authenticated;

-- Storage bucket for screenshots
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.likes enable row level security;
alter table public.activity enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Projects policies
create policy "Projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Authenticated users can create projects"
  on public.projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Authenticated users can like"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- Activity policies
create policy "Activity is viewable by everyone"
  on public.activity for select using (true);

create policy "Authenticated users can create activity"
  on public.activity for insert with check (auth.uid() = user_id);

-- Storage policies
create policy "Screenshot images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "Authenticated users can upload screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and auth.role() = 'authenticated'
  );

create policy "Users can update own screenshots"
  on storage.objects for update
  using (bucket_id = 'screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own screenshots"
  on storage.objects for delete
  using (bucket_id = 'screenshots' and auth.uid()::text = (storage.foldername(name))[1]);
