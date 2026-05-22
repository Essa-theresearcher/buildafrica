-- Link BuildAfrica InventoryPro → your GitHub repo invent-pro
-- Run in Supabase SQL Editor (safe to re-run)

-- Your builder profile on BuildAfrica
insert into public.profiles (
  id, full_name, username, avatar_url, bio, location, skills,
  whatsapp, email, social_links, build_score
)
values (
  '11111111-1111-1111-1111-111111111100',
  'Essa',
  'essa-theresearcher',
  'https://avatars.githubusercontent.com/u/182337125?v=4',
  'Builder of invent-pro — production-grade multi-store inventory & POS.',
  'Somalia',
  array['NestJS', 'Prisma', 'TypeScript', 'MySQL', 'POS Systems'],
  null,
  null,
  '{"github": "https://github.com/Essa-theresearcher/invent-pro", "twitter": "https://github.com/Essa-theresearcher"}'::jsonb,
  920
)
on conflict (id) do update set
  full_name = excluded.full_name,
  username = excluded.username,
  avatar_url = excluded.avatar_url,
  bio = excluded.bio,
  skills = excluded.skills,
  social_links = excluded.social_links,
  build_score = excluded.build_score;

-- Point InventoryPro at your real repo + stack
update public.projects
set
  user_id = '11111111-1111-1111-1111-111111111100',
  title = 'invent-pro',
  slug = 'invent-pro',
  short_description = 'Production-grade multi-store inventory management + POS system.',
  problem_solved = 'Retail and warehouse teams juggle stock, sales, and branches in spreadsheets. invent-pro centralizes inventory, point-of-sale, multi-store ops, and role-based access in one NestJS + Prisma backend.',
  category = 'Inventory',
  tech_stack = array['NestJS', 'Prisma', 'TypeScript', 'MySQL', 'JWT', 'Swagger'],
  demo_url = 'https://github.com/Essa-theresearcher/invent-pro',
  github_url = 'https://github.com/Essa-theresearcher/invent-pro',
  contact_email = 'hello@buildafrica.demo',
  is_featured = true
where slug in ('inventorypro', 'invent-pro')
   or id = '22222222-2222-2222-2222-222222222201';

-- Activity feed mentions your launch
update public.activity
set message = 'Essa launched invent-pro on BuildAfrica'
where project_id = '22222222-2222-2222-2222-222222222201'
  and type = 'project_launched';
