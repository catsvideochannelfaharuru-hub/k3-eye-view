-- K3 Eye View — skema awal
-- Jalankan di Supabase SQL editor project kamu.

create extension if not exists "uuid-ossp";

-- Gedung
create table if not exists buildings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Lantai per gedung
create table if not exists floors (
  id uuid primary key default uuid_generate_v4(),
  building_id uuid not null references buildings(id) on delete cascade,
  level int not null,               -- 1, 2, 3, 4 ...
  name text not null,               -- "Lantai 1"
  image_url text not null,          -- path denah di /floorplans atau Supabase Storage
  image_width int not null,
  image_height int not null,
  elevation_z numeric not null default 0,  -- tinggi kumulatif dari lantai dasar (meter), untuk render 3D
  created_at timestamptz not null default now(),
  unique (building_id, level)
);

-- Kategori titik K3 (APAR, hydrant, detektor asap, laporan bahaya, ...)
create type k3_category as enum ('apar', 'hydrant', 'detektor_asap', 'laporan_bahaya');
create type k3_status as enum ('ok', 'jatuh_tempo_dekat', 'lewat_jatuh_tempo');

-- Titik K3 di atas denah
create table if not exists k3_points (
  id uuid primary key default uuid_generate_v4(),
  floor_id uuid not null references floors(id) on delete cascade,
  category k3_category not null,
  room_name text,
  pos_x numeric not null check (pos_x >= 0 and pos_x <= 1),  -- relatif 0-1 terhadap lebar gambar lantai
  pos_y numeric not null check (pos_y >= 0 and pos_y <= 1),  -- relatif 0-1 terhadap tinggi gambar lantai
  status k3_status not null default 'ok',
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Riwayat inspeksi / laporan bahaya per titik
create table if not exists inspections (
  id uuid primary key default uuid_generate_v4(),
  k3_point_id uuid not null references k3_points(id) on delete cascade,
  inspector_id uuid references auth.users(id),
  inspected_at timestamptz not null default now(),
  result text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Profil user (role: admin / auditor / teknisi)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'teknisi' check (role in ('admin', 'auditor', 'teknisi')),
  created_at timestamptz not null default now()
);

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_k3_points_updated_at on k3_points;
create trigger trg_k3_points_updated_at
  before update on k3_points
  for each row execute function set_updated_at();

-- Row Level Security
alter table buildings enable row level security;
alter table floors enable row level security;
alter table k3_points enable row level security;
alter table inspections enable row level security;
alter table profiles enable row level security;

-- Kebijakan dasar: semua user login (termasuk anonymous/guest) bisa baca & tulis.
-- auth.role() = 'authenticated' juga TRUE untuk user hasil signInAnonymously(),
-- jadi tombol "Masuk sebagai Tamu" di app otomatis ikut policy ini.
-- Perketat lagi nanti sesuai kebutuhan approval/audit trail RS kamu
-- (misal: hanya role admin/teknisi di tabel profiles yang boleh tulis).
create policy "read for authenticated" on buildings for select using (auth.role() = 'authenticated');
create policy "read for authenticated" on floors for select using (auth.role() = 'authenticated');
create policy "read for authenticated" on k3_points for select using (auth.role() = 'authenticated');
create policy "read for authenticated" on inspections for select using (auth.role() = 'authenticated');
create policy "read own profile" on profiles for select using (auth.uid() = id);

create policy "write for authenticated" on k3_points for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "write for authenticated" on inspections for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
