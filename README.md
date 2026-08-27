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

Sekarang bisa langsung dari UI: klik tombol kategori di toolbar **"Tambah titik"** (di
atas denah, mode 2D), lalu klik lokasinya di denah — form akan muncul untuk isi nama
ruangan, status, jatuh tempo, dan catatan. Untuk edit/hapus, klik titik yang sudah ada
di denah lalu klik **"Edit titik ini"** di panel detail.

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
