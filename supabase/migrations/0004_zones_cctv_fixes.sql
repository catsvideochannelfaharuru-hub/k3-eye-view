-- K3 Eye View — fix akses assets_k3 + fitur zona bahaya & CCTV

-- 1. FIX kemungkinan penyebab "+ Dari Asset" kosong: assets_k3 kemungkinan
-- belum punya policy SELECT untuk role authenticated (tabel ini dibuat dari
-- app K3RS App yang sudah ada duluan). Aman ditambahkan — cuma menambah izin
-- baca, tidak mengubah data.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'assets_k3' and policyname = 'read for authenticated (k3 eye view)'
  ) then
    execute 'alter table assets_k3 enable row level security';
    execute 'create policy "read for authenticated (k3 eye view)" on assets_k3
             for select using (auth.role() = ''authenticated'')';
  end if;
end $$;

-- 2. Zona bahaya/berisiko (poligon, bukan garis)
create table if not exists hazard_zones (
  id uuid primary key default uuid_generate_v4(),
  floor_id uuid not null references floors(id) on delete cascade,
  label text,
  zone_type text not null check (zone_type in ('risk', 'danger')), -- risk=kuning, danger=merah
  points jsonb not null, -- array [{"x":0.1,"y":0.2}, ...] poligon tertutup
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table hazard_zones enable row level security;

create policy "read for authenticated" on hazard_zones
  for select using (auth.role() = 'authenticated');
create policy "write for authenticated" on hazard_zones
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop trigger if exists trg_hazard_zones_updated_at on hazard_zones;
create trigger trg_hazard_zones_updated_at
  before update on hazard_zones
  for each row execute function set_updated_at();

-- 3. CCTV: tambah kolom arah pandang kamera + izinkan 'cctv' sebagai marker_type
alter table k3_points add column if not exists direction_deg numeric;

alter table k3_points drop constraint if exists k3_points_marker_type_check;
alter table k3_points add constraint k3_points_marker_type_check
  check (marker_type in ('emergency_exit', 'assembly_point', 'cctv'));
