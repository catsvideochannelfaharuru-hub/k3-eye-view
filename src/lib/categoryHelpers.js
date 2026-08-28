// Kategori equipment K3 standar — SELALU muncul di legend layer, walau belum
// ada asset dari kategori itu yang dipetakan. kategori dari assets_k3.kategori
// dicocokkan ke sini secara fuzzy (case-insensitive, partial match).
export const STANDARD_CATEGORIES = [
  { key: 'apar', label: 'APAR', icon: '🧯' },
  { key: 'hydrant', label: 'Hidran', icon: '💧' },
  { key: 'sprinkler', label: 'Water Sprinkler', icon: '🚿' },
  { key: 'smoke_detector', label: 'Smoke Detector', icon: '🔔' },
  { key: 'heat_detector', label: 'Heat Detector', icon: '🌡️' },
]

export const MARKER_TYPE_META = {
  emergency_exit: { label: 'Jalur Keluar', icon: '🚪' },
  assembly_point: { label: 'Titik Kumpul', icon: '📍' },
  cctv: { label: 'CCTV', icon: '📷' },
}

export const ZONE_TYPE_META = {
  risk: { label: 'Zona Berisiko', color: '#f2994a' },
  danger: { label: 'Zona Berbahaya', color: '#e03131' },
}

// Cocokkan teks kategori bebas dari assets_k3 ke salah satu kategori standar.
// Kalau tidak cocok satupun, dikembalikan sebagai kategori "lainnya" (raw text-nya sendiri).
export function normalizeCategory(kategoriRaw) {
  const k = (kategoriRaw || '').toLowerCase()
  if (k.includes('apar')) return 'apar'
  if (k.includes('hydrant') || k.includes('hidran')) return 'hydrant'
  if (k.includes('sprinkler') || k.includes('springkle') || k.includes('sprinkel')) return 'sprinkler'
  if (k.includes('smoke') || k.includes('asap')) return 'smoke_detector'
  if (k.includes('heat') || k.includes('panas')) return 'heat_detector'
  return kategoriRaw || 'lainnya'
}

export function getCategoryMeta(categoryKey) {
  const found = STANDARD_CATEGORIES.find((c) => c.key === categoryKey)
  if (found) return found
  return { key: categoryKey, label: categoryKey, icon: '🔧' }
}

export const STATUS_META = {
  ok: { label: 'OK', color: '#2f9e44' },
  jatuh_tempo_dekat: { label: 'Jatuh tempo dekat', color: '#f2994a' },
  lewat_jatuh_tempo: { label: 'Lewat jatuh tempo', color: '#e03131' },
}

// Status dihitung otomatis dari tgl_expired dibanding hari ini —
// bukan lagi field yang diisi manual.
export function computeStatus(tglExpired, warningDays = 30) {
  if (!tglExpired) return 'ok'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(tglExpired)
  const diffDays = Math.floor((exp - today) / 86400000)
  if (diffDays < 0) return 'lewat_jatuh_tempo'
  if (diffDays <= warningDays) return 'jatuh_tempo_dekat'
  return 'ok'
}

// Gabungkan k3_points dengan assets_k3 (join di client) + status terhitung.
// Fungsi murni (bukan method store) — dipakai lewat useMemo di komponen untuk
// menghindari infinite-loop render (lihat riwayat perbaikan sebelumnya).
export function enrichPoints(points, assets) {
  return points.map((p) => {
    if (p.marker_type) {
      const meta = MARKER_TYPE_META[p.marker_type]
      return { ...p, category: p.marker_type, displayLabel: p.label || meta.label, icon: meta.icon, status: null }
    }
    const asset = assets.find((a) => a.id === p.asset_id)
    if (!asset) {
      return { ...p, category: null, displayLabel: '(asset tidak ditemukan)', icon: '❓', status: null }
    }
    const category = normalizeCategory(asset.kategori)
    return {
      ...p,
      category,
      displayLabel: asset.nama_perangkat || asset.kode_asset,
      icon: getCategoryMeta(category).icon,
      status: computeStatus(asset.tgl_expired),
      asset,
    }
  })
}

export function getUnmappedAssets(points, assets) {
  const mappedIds = new Set(points.filter((p) => p.asset_id).map((p) => p.asset_id))
  return assets.filter((a) => !mappedIds.has(a.id))
}
