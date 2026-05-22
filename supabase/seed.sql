-- BuildAfrica demo seed data
-- Run AFTER schema.sql in Supabase SQL Editor.
-- Demo profiles use fixed UUIDs not in auth.users — temporarily drop FK for seed only.

alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Demo builder profiles
insert into public.profiles (id, full_name, username, avatar_url, bio, location, skills, whatsapp, email, social_links, build_score)
values
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
    '11111111-1111-1111-1111-111111111101',
    'InventoryPro',
    'inventorypro',
    'Smart inventory management for growing businesses.',
    'Small retailers lose stock visibility across branches. InventoryPro gives real-time counts, low-stock alerts, and supplier reorder suggestions.',
    'Inventory',
    array['Next.js', 'Supabase', 'Tailwind'],
    'https://inventorypro.demo',
    'https://github.com/omarissa/inventorypro',
    'omar@buildafrica.demo',
    '+252611000001',
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
    array['https://images.unsplash.com/photo-1521737711862-e3b97311f8bf?w=800&q=80'],
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
    array['https://images.unsplash.com/photo-1503676260728-1c00da280a02?w=800&q=80'],
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
