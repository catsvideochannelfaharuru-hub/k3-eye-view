// Kategori sekarang datang dinamis dari assets_k3.kategori (bukan enum tetap),
// jadi icon/label ditentukan lewat heuristik nama, bukan lookup object statis.

export const MARKER_TYPE_META = {
  emergency_exit: { label: 'Jalur Keluar', icon: '🚪' },
  assembly_point: { label: 'Titik Kumpul', icon: '📍' },
}

export function getCategoryIcon(kategori) {
  const k = (kategori || '').toLowerCase()
  if (k.includes('apar')) return '🧯'
  if (k.includes('hydrant') || k.includes('hidran')) return '💧'
  if (k.includes('detektor') || k.includes('asap') || k.includes('smoke')) return '🔔'
  if (k.includes('alarm')) return '🔊'
  return '🔧'
}

// Gabungkan k3_points dengan assets_k3 (join di client) + status terhitung.
// Dipisah jadi fungsi murni (bukan method di store) supaya bisa dipakai lewat
// useMemo di komponen — mencegah infinite-loop render (lihat catatan di
// masing-masing komponen pemakainya).
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
    return {
      ...p,
      category: asset.kategori,
      displayLabel: asset.nama_perangkat || asset.kode_asset,
      icon: getCategoryIcon(asset.kategori),
      status: computeStatus(asset.tgl_expired),
      asset,
    }
  })
}

export function getUnmappedAssets(points, assets) {
  const mappedIds = new Set(points.filter((p) => p.asset_id).map((p) => p.asset_id))
  return assets.filter((a) => !mappedIds.has(a.id))
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
