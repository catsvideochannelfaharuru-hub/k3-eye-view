-- K3 Eye View — integrasi master data assets_k3 + jalur evakuasi
-- Jalankan setelah 0001_init.sql dan 0002_seed.sql.
--
-- PERUBAHAN BESAR: k3_points sekarang HANYA menyimpan "di mana pin diletakkan di
-- peta" (floor_id, posisi, referensi ke assets_k3) — bukan lagi kategori/status/
-- catatan sendiri. Data itu semua diambil dari assets_k3 (source of truth).
--
-- CATATAN: sesuai keputusan kamu, data lama di k3_points (4 titik contoh) DIHAPUS
-- karena belum ter-link ke assets_k3. Kalau ada data k3_points asli yang mau
-- dipertahankan, backup dulu sebelum jalankan migration ini.

-- 1. Hapus data lama & kolom yang sudah tidak dipakai
delete from k3_points;

alter table k3_points
  drop column if exists category,
  drop column if exists room_name,
  drop column if exists status,
  drop column if exists due_date,
  drop column if exists notes;

drop type if exists k3_category;
drop type if exists k3_status;

-- 2. Tambah kolom baru
-- CATATAN: assets_k3.id bertipe TEXT (bukan uuid) — makanya asset_id di sini
-- juga TEXT supaya foreign key-nya cocok.
alter table k3_points
  add column if not exists asset_id text references assets_k3(id) on delete cascade,
  add column if not exists marker_type text check (marker_type in ('emergency_exit', 'assembly_point')),
  add column if not exists label text;

-- Satu asset cuma boleh dipetakan di satu titik (1-ke-1).
-- Constraint ini cuma berlaku kalau asset_id diisi (marker exit/assembly_point punya asset_id NULL).
create unique index if not exists k3_points_asset_id_unique
  on k3_points (asset_id) where asset_id is not null;

-- Pastikan tiap titik jelas jenisnya: entah nempel ke asset, entah marker manual.
alter table k3_points
  add constraint k3_points_kind_check
  check (
    (asset_id is not null and marker_type is null)
    or (asset_id is null and marker_type is not null)
  );

-- 3. Tabel jalur evakuasi (garis, bukan titik)
create table if not exists evacuation_routes (
  id uuid primary key default uuid_generate_v4(),
  floor_id uuid not null references floors(id) on delete cascade,
  label text,
  points jsonb not null, -- array [{"x":0.12,"y":0.34}, ...] relatif 0-1 terhadap gambar lantai
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table evacuation_routes enable row level security;

create policy "read for authenticated" on evacuation_routes
  for select using (auth.role() = 'authenticated');

create policy "write for authenticated" on evacuation_routes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop trigger if exists trg_evacuation_routes_updated_at on evacuation_routes;
create trigger trg_evacuation_routes_updated_at
  before update on evacuation_routes
  for each row execute function set_updated_at();
