import { useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getCategoryMeta, getUnmappedAssets, normalizeCategory } from '../lib/categoryHelpers'

export default function AssetPickerModal({ onClose }) {
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const unmappedAssets = useMemo(() => getUnmappedAssets(points, assets), [points, assets])
  const startPlaceAsset = useAppStore((s) => s.startPlaceAsset)
  const [query, setQuery] = useState('')
  const [activeCatFilters, setActiveCatFilters] = useState([]) // kosong = tampilkan semua

  // Badge kategori + jumlah, dihitung dari asset yang belum dipetakan
  const categoryCounts = useMemo(() => {
    const map = new Map()
    unmappedAssets.forEach((a) => {
      const key = normalizeCategory(a.kategori)
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([key, count]) => ({ ...getCategoryMeta(key), count }))
  }, [unmappedAssets])

  function toggleCatFilter(key) {
    setActiveCatFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const filtered = unmappedAssets.filter((a) => {
    const catKey = normalizeCategory(a.kategori)
    if (activeCatFilters.length > 0 && !activeCatFilters.includes(catKey)) return false
    const q = query.toLowerCase()
    if (!q) return true
    return (
      a.nama_perangkat?.toLowerCase().includes(q) ||
      a.kode_asset?.toLowerCase().includes(q) ||
      a.kategori?.toLowerCase().includes(q) ||
      a.lokasi?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Pilih Asset</h2>
        <p className="modal-category">
          Cuma asset yang belum dipetakan ke lokasi manapun yang muncul di sini.
        </p>

        {categoryCounts.length > 0 && (
          <div className="asset-picker__badges">
            {categoryCounts.map(({ key, label, icon, count }) => (
              <button
                key={key}
                className={`asset-picker__badge ${activeCatFilters.includes(key) ? 'active' : ''}`}
                onClick={() => toggleCatFilter(key)}
              >
                {icon} {label} <span>{count}</span>
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder="Cari nama, kode, kategori, atau lokasi…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="asset-picker__search"
        />
        <div className="asset-picker__list">
          {filtered.length === 0 && (
            <div className="asset-picker__empty">
              {unmappedAssets.length === 0 ? 'Semua asset sudah dipetakan.' : 'Tidak ada asset yang cocok.'}
            </div>
          )}
          {filtered.map((a) => {
            const meta = getCategoryMeta(normalizeCategory(a.kategori))
            return (
              <button
                key={a.id}
                className="asset-picker__item"
                onClick={() => { startPlaceAsset(a); onClose() }}
              >
                <span className="asset-picker__icon">{meta.icon}</span>
                <span className="asset-picker__info">
                  <strong>{a.nama_perangkat || a.kode_asset}</strong>
                  <span>{a.kategori} • {a.lokasi || 'lokasi belum diisi'}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="modal-actions">
          <div />
          <button type="button" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  )
}
