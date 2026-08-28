// Data contoh lokal — dipakai kalau Supabase belum dikonfigurasi / project kosong.

export const FALLBACK_BUILDING = {
  id: 'demo-building',
  name: 'SH Sentosa - Expansion (Gedung A&B) — DATA CONTOH',
}

export const FALLBACK_FLOORS = [
  { id: 'floor-1', building_id: 'demo-building', level: 1, name: 'Lantai 1', image_url: '/floorplans/lantai-1.png', image_width: 1800, image_height: 1100, elevation_z: 0 },
  { id: 'floor-2', building_id: 'demo-building', level: 2, name: 'Lantai 2', image_url: '/floorplans/lantai-2.png', image_width: 1800, image_height: 1100, elevation_z: 3.75 },
  { id: 'floor-3', building_id: 'demo-building', level: 3, name: 'Lantai 3', image_url: '/floorplans/lantai-3.png', image_width: 1800, image_height: 1100, elevation_z: 7.5 },
  { id: 'floor-4', building_id: 'demo-building', level: 4, name: 'Lantai 4', image_url: '/floorplans/lantai-4.png', image_width: 1800, image_height: 1100, elevation_z: 11.25 },
]

// Meniru tabel assets_k3 (master data)
export const FALLBACK_ASSETS = [
  { id: 'asset-1', kode_asset: 'APR-001', kategori: 'APAR', nama_perangkat: 'APAR 3kg ABC', merk: 'Yamato', jenis: 'Powder', lokasi: 'Loading Area', tgl_expired: '2027-01-01', tgl_asset: '2024-01-01', checklist_rutin: true, zona: 'Gedung Baru' },
  { id: 'asset-2', kode_asset: 'APR-002', kategori: 'APAR', nama_perangkat: 'APAR 3kg ABC', merk: 'Yamato', jenis: 'Powder', lokasi: 'Farmasi', tgl_expired: '2026-05-01', tgl_asset: '2023-05-01', checklist_rutin: true, zona: 'Gedung Baru' },
  { id: 'asset-3', kode_asset: 'HYD-001', kategori: 'Hydrant', nama_perangkat: 'Hydrant Box', merk: 'Appron', jenis: 'Indoor', lokasi: 'Lobby Utama', tgl_expired: null, tgl_asset: '2023-01-01', checklist_rutin: true, zona: 'Gedung Baru' },
  { id: 'asset-4', kode_asset: 'DET-001', kategori: 'Smoke Detector', nama_perangkat: 'Smoke Detector', merk: 'Honeywell', jenis: 'Optical', lokasi: 'Gudang', tgl_expired: '2026-09-15', tgl_asset: '2023-01-01', checklist_rutin: true, zona: 'Gedung Baru' },
  { id: 'asset-5', kode_asset: 'APR-003', kategori: 'APAR', nama_perangkat: 'APAR 6kg CO2', merk: 'Yamato', jenis: 'CO2', lokasi: 'OPD Lt.2', tgl_expired: '2026-12-01', tgl_asset: '2024-06-01', checklist_rutin: true, zona: 'Gedung Baru' },
  { id: 'asset-6', kode_asset: 'SPR-001', kategori: 'Sprinkler', nama_perangkat: 'Water Sprinkler Head', merk: 'Viking', jenis: 'Pendant', lokasi: 'Farmasi', tgl_expired: null, tgl_asset: '2023-01-01', checklist_rutin: true, zona: 'Gedung Baru' },
  { id: 'asset-7', kode_asset: 'HD-001', kategori: 'Heat Detector', nama_perangkat: 'Heat Detector', merk: 'Honeywell', jenis: 'Fixed', lokasi: 'Dapur', tgl_expired: '2026-10-01', tgl_asset: '2023-01-01', checklist_rutin: true, zona: 'Gedung Baru' },
]

// k3_points — cuma "pin di peta": asset_id ATAU marker_type, tidak dua-duanya.
export const FALLBACK_POINTS = [
  { id: 'p1', floor_id: 'floor-1', asset_id: 'asset-1', marker_type: null, label: null, pos_x: 0.5, pos_y: 0.22, direction_deg: null },
  { id: 'p2', floor_id: 'floor-1', asset_id: 'asset-2', marker_type: null, label: null, pos_x: 0.4, pos_y: 0.42, direction_deg: null },
  { id: 'p3', floor_id: 'floor-1', asset_id: 'asset-3', marker_type: null, label: null, pos_x: 0.62, pos_y: 0.55, direction_deg: null },
  { id: 'p4', floor_id: 'floor-1', asset_id: 'asset-4', marker_type: null, label: null, pos_x: 0.3, pos_y: 0.5, direction_deg: null },
  { id: 'p6', floor_id: 'floor-2', asset_id: 'asset-5', marker_type: null, label: null, pos_x: 0.55, pos_y: 0.45, direction_deg: null },
  { id: 'm1', floor_id: 'floor-1', asset_id: null, marker_type: 'emergency_exit', label: 'Pintu Keluar Timur', pos_x: 0.78, pos_y: 0.48, direction_deg: null },
  { id: 'm2', floor_id: 'floor-1', asset_id: null, marker_type: 'assembly_point', label: 'Titik Kumpul Parkiran Depan', pos_x: 0.68, pos_y: 0.78, direction_deg: null },
  { id: 'm3', floor_id: 'floor-1', asset_id: null, marker_type: 'cctv', label: 'CCTV Lobby', pos_x: 0.58, pos_y: 0.5, direction_deg: 135 },
]

export const FALLBACK_ROUTES = [
  {
    id: 'r1',
    floor_id: 'floor-1',
    label: 'Jalur A',
    points: [
      { x: 0.4, y: 0.42 },
      { x: 0.55, y: 0.5 },
      { x: 0.78, y: 0.48 },
    ],
  },
]

export const FALLBACK_ZONES = [
  {
    id: 'z1',
    floor_id: 'floor-1',
    label: 'Area Genset & B3',
    zone_type: 'danger',
    points: [
      { x: 0.58, y: 0.18 },
      { x: 0.7, y: 0.18 },
      { x: 0.7, y: 0.3 },
      { x: 0.58, y: 0.3 },
    ],
  },
]
