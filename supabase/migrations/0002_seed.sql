-- Seed: gedung SH Sentosa - Expansion + 4 lantai
-- image_url mengacu ke file statis di /public/floorplans (di-serve dari app),
-- ganti ke URL Supabase Storage kalau kamu upload ke sana.

insert into buildings (id, name)
values ('00000000-0000-0000-0000-000000000001', 'SH Sentosa - Expansion (Gedung A&B)')
on conflict (id) do nothing;

insert into floors (building_id, level, name, image_url, image_width, image_height, elevation_z)
values
  ('00000000-0000-0000-0000-000000000001', 1, 'Lantai 1', '/floorplans/lantai-1.png', 1800, 1100, 0),
  ('00000000-0000-0000-0000-000000000001', 2, 'Lantai 2', '/floorplans/lantai-2.png', 1800, 1100, 3.75),
  ('00000000-0000-0000-0000-000000000001', 3, 'Lantai 3', '/floorplans/lantai-3.png', 1800, 1100, 7.50),
  ('00000000-0000-0000-0000-000000000001', 4, 'Lantai 4', '/floorplans/lantai-4.png', 1800, 1100, 11.25)
on conflict (building_id, level) do nothing;
