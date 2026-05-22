-- BuildAfrica: run this entire file once in Supabase SQL Editor

-- BuildAfrica V1 — Supabase schema
-- Run in Supabase SQL Editor after creating a project.

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

-- ========== SEED DATA ==========

-- BuildAfrica demo seed data
-- Run AFTER schema.sql in Supabase SQL Editor.
-- Demo profiles use fixed UUIDs not in auth.users — temporarily drop FK for seed only.

alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Demo builder profiles
insert into public.profiles (id, full_name, username, avatar_url, bio, location, skills, whatsapp, email, social_links, build_score)
values
  (
    '11111111-1111-1111-1111-111111111100',
    'Essa',
    'essa-theresearcher',
    'https://avatars.githubusercontent.com/u/182337125?v=4',
    'Builder of invent-pro — production-grade multi-store inventory & POS.',
    'Somalia',
    array['NestJS', 'Prisma', 'TypeScript', 'MySQL', 'POS Systems'],
    null,
    null,
    '{"github": "https://github.com/Essa-theresearcher/invent-pro"}'::jsonb,
    920
  ),
  (
    '11111111-1111-1111-1111-111111111101',
    'Omar Issa',
    'omar-issa',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=omar-issa',
    'Full-stack builder shipping SaaS for East Africa. Previously fintech at a Nairobi startup.',
    'Mogadishu, Somalia',
    array['Next.js', 'TypeScript', 'PostgreSQL', 'Product'],
    '+252611000001',
    'omar@buildafrica.demo',
    '{"twitter": "https://twitter.com/omarissa", "github": "https://github.com/omarissa", "linkedin": "https://linkedin.com/in/omarissa"}'::jsonb,
    847
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Amina Ali',
    'amina-ali',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=amina-ali',
    'AI engineer building hiring and education tools. Passionate about local talent pipelines.',
    'Hargeisa, Somaliland',
    array['Python', 'LLMs', 'React', 'ML Ops'],
    '+252611000002',
    'amina@buildafrica.demo',
    '{"twitter": "https://twitter.com/aminaali", "github": "https://github.com/aminaali"}'::jsonb,
    923
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'Ibrahim Hassan',
    'ibrahim-hassan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim-hassan',
    'EdTech founder. School systems, parent portals, and offline-first mobile apps.',
    'Nairobi, Kenya',
    array['Flutter', 'Firebase', 'Node.js'],
    '+254711000003',
    'ibrahim@buildafrica.demo',
    '{"linkedin": "https://linkedin.com/in/ibrahimhassan"}'::jsonb,
    712
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    'Fadumo Noor',
    'fadumo-noor',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=fadumo-noor',
    'Logistics & ops dashboards for ports and freight. Ex-supply chain analyst.',
    'Djibouti City, Djibouti',
    array['React', 'Maps API', 'Supabase', 'Analytics'],
    '+253611000004',
    'fadumo@buildafrica.demo',
    '{"github": "https://github.com/fadumonoor"}'::jsonb,
    689
  ),
  (
    '11111111-1111-1111-1111-111111111105',
    'Yahye Mohamed',
    'yahye-mohamed',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=yahye-mohamed',
    'Creator tools & media AI. Building clip automation for creators and agencies.',
    'Addis Ababa, Ethiopia',
    array['Python', 'FFmpeg', 'Next.js', 'OpenAI'],
    '+251911000005',
    'yahye@buildafrica.demo',
    '{"twitter": "https://twitter.com/yahyem", "github": "https://github.com/yahyem"}'::jsonb,
    801
  )
on conflict (id) do nothing;

-- Demo projects
insert into public.projects (
  id, user_id, title, slug, short_description, problem_solved, category,
  tech_stack, demo_url, github_url, contact_email, whatsapp, screenshots,
  views, likes, is_featured, created_at
)
values
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111100',
    'invent-pro',
    'invent-pro',
    'Production-grade multi-store inventory management + POS system.',
    'Retail and warehouse teams juggle stock, sales, and branches in spreadsheets. invent-pro centralizes inventory, point-of-sale, multi-store ops, and role-based access in one NestJS + Prisma backend.',
    'Inventory',
    array['NestJS', 'Prisma', 'TypeScript', 'MySQL', 'JWT', 'Swagger'],
    'https://github.com/Essa-theresearcher/invent-pro',
    'https://github.com/Essa-theresearcher/invent-pro',
    'hello@buildafrica.demo',
    null,
    array[
      'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
    ],
    1240, 89, true,
    now() - interval '12 days'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111102',
    'HireMatch AI',
    'hirematch-ai',
    'AI-powered ATS and resume matcher for hiring teams.',
    'HR teams in emerging markets spend hours screening mismatched CVs. HireMatch scores fit, highlights gaps, and ranks candidates in minutes.',
    'AI',
    array['Python', 'FastAPI', 'OpenAI', 'React'],
    'https://hirematch.demo',
    'https://github.com/aminaali/hirematch',
    'amina@buildafrica.demo',
    '+252611000002',
    array[
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'
    ],
    2103, 156, true,
    now() - interval '8 days'
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111103',
    'SchoolFlow',
    'schoolflow',
    'School management system for admins, teachers, and parents.',
    'Paper registers and WhatsApp chains break down at scale. SchoolFlow centralizes attendance, fees, grades, and parent updates.',
    'Education',
    array['Flutter', 'Firebase', 'Node.js'],
    'https://schoolflow.demo',
    null,
    'ibrahim@buildafrica.demo',
    '+254711000003',
    array[
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80'
    ],
    987, 67, true,
    now() - interval '5 days'
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111104',
    'CargoTrack',
    'cargotrack',
    'Logistics and cargo tracking dashboard for freight operators.',
    'Shippers lack a single view of container status across carriers. CargoTrack unifies milestones, delays, and port ETAs.',
    'Logistics',
    array['React', 'Mapbox', 'Supabase', 'Node.js'],
    'https://cargotrack.demo',
    'https://github.com/fadumonoor/cargotrack',
    'fadumo@buildafrica.demo',
    '+253611000004',
    array['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'],
    756, 42, false,
    now() - interval '3 days'
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '11111111-1111-1111-1111-111111111105',
    'ClipCraft',
    'clipcraft',
    'AI video clipping tool for creators and agencies.',
    'Long-form podcasts are hard to repurpose. ClipCraft finds highlight moments and exports vertical clips with captions.',
    'AI',
    array['Python', 'FFmpeg', 'Next.js', 'Whisper'],
    'https://clipcraft.demo',
    'https://github.com/yahyem/clipcraft',
    'yahye@buildafrica.demo',
    '+251911000005',
    array['https://images.unsplash.com/photo-1611162616305-c69b3fa7a0be?w=800&q=80'],
    1589, 112, false,
    now() - interval '1 day'
  )
on conflict (id) do nothing;

-- Activity feed
insert into public.activity (type, user_id, project_id, message, created_at)
values
  ('project_launched', '11111111-1111-1111-1111-111111111100', '22222222-2222-2222-2222-222222222201', 'Essa launched invent-pro', now() - interval '12 days'),
  ('project_launched', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222205', 'Yahye Mohamed launched ClipCraft', now() - interval '1 day'),
  ('project_launched', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 'Fadumo Noor launched CargoTrack', now() - interval '3 days'),
  ('project_launched', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 'Ibrahim Hassan launched SchoolFlow', now() - interval '5 days'),
  ('project_liked', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', 'Omar Issa upvoted HireMatch AI', now() - interval '6 hours'),
  ('builder_joined', '11111111-1111-1111-1111-111111111102', null, 'Amina Ali joined BuildAfrica', now() - interval '14 days');

-- Re-add FK for real signups; existing demo rows stay valid via NOT VALID
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade
  not valid;
