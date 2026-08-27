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

## Menambah titik K3 baru

Untuk sekarang, titik ditambah langsung lewat Supabase Table Editor / SQL
(tabel `k3_points`, kolom `pos_x`/`pos_y` = posisi relatif 0–1 di atas gambar
lantai — 0,0 = pojok kiri-atas gambar). Form tambah/edit titik dari UI (klik-untuk-taruh-pin)
belum dibuat — masuk sebagai langkah berikutnya.

## Catatan tinggi lantai (3D)

`elevation_z` di tabel `floors` memakai asumsi ~3.75 m per lantai (standar RS).
Ganti sesuai data tinggi lantai aktual kalau kamu punya gambar potongan (section).

## Rencana lanjutan (belum dikerjakan)

- Form input/edit titik K3 langsung dari UI (klik di denah untuk taruh pin baru)
- Autentikasi Supabase + role (admin/auditor/teknisi) — skema & RLS dasar sudah disiapkan di migration
- Riwayat inspeksi per titik (tabel `inspections` sudah ada, UI belum)
- Kartu "Kepatuhan pelatihan" — perlu tabel training terpisah, belum ada di skema
- Upload denah & foto inspeksi ke Supabase Storage (sekarang gambar lantai masih statis di `public/`)
