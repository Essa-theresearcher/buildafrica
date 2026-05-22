-- Fix broken screenshot URLs for HireMatch AI and SchoolFlow (old Unsplash links returned 404)
-- Run in Supabase SQL Editor

update public.projects
set screenshots = array[
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'
]
where slug = 'hirematch-ai';

update public.projects
set screenshots = array[
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80'
]
where slug = 'schoolflow';
