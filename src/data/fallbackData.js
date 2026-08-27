// Data contoh lokal — dipakai kalau tabel Supabase masih kosong / belum dikonfigurasi.
// Ganti / hapus begitu data asli sudah diinput lewat Supabase.

export const FALLBACK_BUILDING = {
  id: 'demo-building',
  name: 'SH Sentosa - Expansion (Gedung A&B) — DATA CONTOH',
}

export const FALLBACK_FLOORS = [
  {
    id: 'floor-1',
    building_id: 'demo-building',
    level: 1,
    name: 'Lantai 1',
    image_url: '/floorplans/lantai-1.png',
    image_width: 1800,
    image_height: 1100,
    elevation_z: 0,
  },
  {
    id: 'floor-2',
    building_id: 'demo-building',
    level: 2,
    name: 'Lantai 2',
    image_url: '/floorplans/lantai-2.png',
    image_width: 1800,
    image_height: 1100,
    elevation_z: 3.75,
  },
  {
    id: 'floor-3',
    building_id: 'demo-building',
    level: 3,
    name: 'Lantai 3',
    image_url: '/floorplans/lantai-3.png',
    image_width: 1800,
    image_height: 1100,
    elevation_z: 7.5,
  },
  {
    id: 'floor-4',
    building_id: 'demo-building',
    level: 4,
    name: 'Lantai 4',
    image_url: '/floorplans/lantai-4.png',
    image_width: 1800,
    image_height: 1100,
    elevation_z: 11.25,
  },
]

export const FALLBACK_POINTS = [
  { id: 'p1', floor_id: 'floor-1', category: 'apar', room_name: 'Loading Area', pos_x: 0.5, pos_y: 0.22, status: 'ok', due_date: null, notes: '' },
  { id: 'p2', floor_id: 'floor-1', category: 'apar', room_name: 'Farmasi', pos_x: 0.4, pos_y: 0.42, status: 'lewat_jatuh_tempo', due_date: '2026-05-01', notes: 'Belum diisi ulang' },
  { id: 'p3', floor_id: 'floor-1', category: 'hydrant', room_name: 'Lobby Utama', pos_x: 0.62, pos_y: 0.55, status: 'ok', due_date: null, notes: '' },
  { id: 'p4', floor_id: 'floor-1', category: 'detektor_asap', room_name: 'Gudang', pos_x: 0.3, pos_y: 0.5, status: 'jatuh_tempo_dekat', due_date: '2026-09-10', notes: 'Jadwal kalibrasi mendekat' },
  { id: 'p5', floor_id: 'floor-1', category: 'laporan_bahaya', room_name: 'Ruang OK', pos_x: 0.35, pos_y: 0.3, status: 'lewat_jatuh_tempo', due_date: null, notes: 'Kabel terbuka dekat wastafel' },
  { id: 'p6', floor_id: 'floor-2', category: 'apar', room_name: 'OPD', pos_x: 0.55, pos_y: 0.45, status: 'ok', due_date: null, notes: '' },
  { id: 'p7', floor_id: 'floor-2', category: 'hydrant', room_name: 'Cathlab', pos_x: 0.5, pos_y: 0.25, status: 'jatuh_tempo_dekat', due_date: '2026-09-05', notes: '' },
  { id: 'p8', floor_id: 'floor-3', category: 'apar', room_name: 'IPD Kelas 2', pos_x: 0.6, pos_y: 0.4, status: 'ok', due_date: null, notes: '' },
  { id: 'p9', floor_id: 'floor-4', category: 'apar', room_name: 'IPD VIP', pos_x: 0.55, pos_y: 0.35, status: 'ok', due_date: null, notes: '' },
]
