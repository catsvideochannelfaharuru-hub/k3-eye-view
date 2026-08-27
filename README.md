# K3 Eye View

Dashboard monitoring K3 (APAR, Hydrant, Detektor Asap, Laporan Bahaya) per lantai gedung,
dengan visualisasi 2D (denah datar) dan 3D (tumpukan lempengan denah/floor-stack).
Backend: Supabase (Postgres + Auth + Realtime + Storage).

Terinspirasi dari pola UX repo [gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view)
(klik entitas → detail, layer toggle, legenda status) — stack teknisnya dibangun ulang
dari nol dengan React + Supabase karena kebutuhannya berbeda (denah gedung interior,
bukan globe geospasial dunia).

## Quick Start

1. Salin `.env.example` → `.env`, isi kredensial project Supabase kamu:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxx
   ```
2. Jalankan migration SQL di **Supabase SQL Editor**, berurutan:
   - `supabase/migrations/0001_init.sql` — skema tabel (buildings, floors, k3_points, inspections, profiles)
   - `supabase/migrations/0002_seed.sql` — seed 1 gedung + 4 lantai (memakai gambar di `public/floorplans`)
3. Install & jalankan:
   ```
   npm install
   npm run dev
   ```
4. Buka `http://localhost:5173`.

Selama tabel `buildings` masih kosong / `.env` belum diisi, app otomatis
menampilkan **data contoh lokal** (lihat `src/data/fallbackData.js`) supaya tetap
bisa didemokan tanpa Supabase — nanti tinggal isi data asli lewat Supabase dan
data contoh otomatis tergantikan.

## Struktur

```
src/
├── lib/
│   ├── supabaseClient.js     # koneksi Supabase
│   └── useLoadK3Data.js      # fetch building/floors/points + fallback
├── store/useAppStore.js      # state global (zustand): lantai aktif, layer, titik terpilih
├── data/fallbackData.js      # data contoh lokal
├── components/
│   ├── FloorTabs.jsx         # tab pilih lantai
│   ├── SummaryStats.jsx      # angka ringkasan atas
│   ├── LayerPanel.jsx        # toggle kategori + legenda status
│   ├── Floor2DView.jsx       # denah datar + titik overlay
│   ├── Floor3DView.jsx       # gedung 3D (floor-stack, react-three-fiber)
│   ├── DetailPanel.jsx       # panel detail titik terpilih
│   └── ViewModeToggle.jsx    # switch 2D/3D
└── pages/DashboardPage.jsx   # rakit semua komponen

public/floorplans/            # denah PNG bersih per lantai (hasil crop dari PDF/DWG asli)
supabase/migrations/          # SQL skema + seed
```

## Menambah data K3 (versi terbaru — integrasi assets_k3)

**Perubahan arsitektur penting:** `k3_points` sekarang murni "pin lokasi di peta" —
kategori, status, dan detail asset (merk, lokasi, tanggal kadaluarsa) diambil
langsung dari tabel `assets_k3` (master data, dikelola dari app K3RS App yang
sudah ada). Status OK/jatuh-tempo-dekat/lewat-jatuh-tempo dihitung **otomatis**
dari `tgl_expired`, bukan diisi manual.

Toolbar di atas denah (mode 2D) punya 4 opsi:
- **+ Dari Asset** — pilih asset yang belum dipetakan (dari `assets_k3`), lalu klik lokasinya di denah.
- **🚪 Jalur Keluar** / **📍 Titik Kumpul** — marker manual (tidak terhubung ke asset), untuk emergency exit & assembly point.
- **➰ Gambar Jalur Evakuasi** — klik beberapa titik di denah untuk bikin garis jalur evakuasi, simpan ke tabel `evacuation_routes`.

Klik titik yang sudah ada di panel detail untuk **pindahkan** atau **lepas dari peta**
(untuk asset) / **ubah label** (untuk marker).

## Zoom pada denah

Kontrol zoom (+/−/Reset) ada di pojok kiri atas viewer 2D. Berguna untuk mapping
titik presisi di ruangan kecil/padat. Saat zoom in, geser dengan scroll biasa.

## Migration database

Jalankan migration secara berurutan di Supabase SQL Editor:
1. `0001_init.sql` — skema awal
2. `0002_seed.sql` — seed gedung & lantai
3. `0003_assets_integration.sql` — **PENTING**: mengubah `k3_points` untuk reference
   ke `assets_k3` (menghapus kolom lama: category/room_name/status/due_date/notes),
   dan menambah tabel `evacuation_routes`. Migration ini **menghapus semua data
   k3_points lama** — pastikan itu memang yang kamu mau (sesuai keputusan kamu:
   mulai bersih dari assets_k3).

## Autentikasi (Supabase Auth)

App sekarang mewajibkan login sebelum bisa melihat/mengedit data. Dua cara masuk:

1. **Email/password** — daftar dulu lewat form "Daftar", Supabase akan kirim email
   verifikasi (tergantung setting project kamu).
2. **Tombol "Masuk sebagai Tamu"** (mode development) — pakai fitur *Anonymous Sign-In*
   Supabase. **Wajib diaktifkan dulu** di Supabase Dashboard:
   `Authentication` → `Sign In / Providers` → aktifkan **"Allow anonymous sign-ins"**.
   Tanpa ini, tombol Tamu akan gagal dengan error yang jelas di layar.

Untuk **mematikan** opsi Tamu nanti saat go-live (supaya semua wajib pakai akun asli),
tambahkan env var ini di Netlify (dan `.env` lokal):
```
VITE_ENABLE_GUEST_LOGIN=false
```

Baik user login biasa maupun tamu, keduanya dianggap `authenticated` oleh Supabase RLS
(lihat komentar di `0001_init.sql`) — jadi keduanya bisa baca & tulis data k3_points
selama policy belum kamu perketat per-role.

## Catatan tinggi lantai (3D)

`elevation_z` di tabel `floors` memakai asumsi ~3.75 m per lantai (standar RS).
Ganti sesuai data tinggi lantai aktual kalau kamu punya gambar potongan (section).

## Rencana lanjutan (belum dikerjakan)

- Autentikasi Supabase + role (admin/auditor/teknisi) — skema & RLS dasar sudah disiapkan di migration
- Riwayat inspeksi per titik (tabel `inspections` sudah ada, UI belum)
- Kartu "Kepatuhan pelatihan" — perlu tabel training terpisah, belum ada di skema
- Upload denah & foto inspeksi ke Supabase Storage (sekarang gambar lantai masih statis di `public/`)
