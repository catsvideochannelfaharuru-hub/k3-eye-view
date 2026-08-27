import { useMemo } from 'react'
import { useAppStore, STATUS_META } from '../store/useAppStore'
import { MARKER_TYPE_META, enrichPoints } from '../lib/categoryHelpers'
import { deletePoint, updateMarkerLabel } from '../lib/k3PointsApi'

export default function DetailPanel() {
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const enrichedPoints = useMemo(() => enrichPoints(points, assets), [points, assets])
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const startPlaceAsset = useAppStore((s) => s.startPlaceAsset)
  const startPlaceMarker = useAppStore((s) => s.startPlaceMarker)
  const point = enrichedPoints.find((p) => p.id === selectedPointId)

  if (!point) {
    return (
      <div className="detail-panel detail-panel--empty">
        Klik salah satu titik di denah untuk melihat detailnya.
      </div>
    )
  }

  async function handleDelete() {
    if (!confirm('Hapus titik ini dari peta? (asset di master data tidak ikut terhapus)')) return
    await deletePoint(point.id)
  }

  async function handleRename() {
    const newLabel = window.prompt('Ubah label:', point.label || '')
    if (newLabel === null) return
    await updateMarkerLabel(point.id, newLabel)
  }

  async function handleMove() {
    await deletePoint(point.id) // hapus dulu, lalu taruh ulang lewat mode placement
    if (point.marker_type) {
      startPlaceMarker(point.marker_type)
    } else if (point.asset) {
      startPlaceAsset(point.asset)
    }
  }

  if (point.marker_type) {
    const meta = MARKER_TYPE_META[point.marker_type]
    return (
      <div className="detail-panel">
        <div className="detail-panel__header">
          <span className="layer-row__icon">{meta.icon}</span>
          <span>{meta.label}</span>
        </div>
        <div className="detail-panel__room">{point.label || meta.label}</div>
        <div className="detail-panel__actions-row">
          <button onClick={handleRename}>Ubah label</button>
          <button onClick={handleMove}>Pindahkan</button>
          <button className="detail-panel__delete" onClick={handleDelete}>Hapus</button>
        </div>
      </div>
    )
  }

  const status = point.status ? STATUS_META[point.status] : null
  const asset = point.asset

  return (
    <div className="detail-panel">
      <div className="detail-panel__header">
        <span className="layer-row__icon">{point.icon}</span>
        <span>{point.category}</span>
      </div>
      <div className="detail-panel__room">{point.displayLabel}</div>
      {status && (
        <div className="detail-panel__status">
          <span className="status-dot" style={{ background: status.color }} />
          {status.label}
        </div>
      )}
      {asset && (
        <>
          <div className="detail-panel__row"><span>Kode asset</span><span>{asset.kode_asset}</span></div>
          <div className="detail-panel__row"><span>Lokasi</span><span>{asset.lokasi || '—'}</span></div>
          <div className="detail-panel__row"><span>Merk / jenis</span><span>{asset.merk} {asset.jenis}</span></div>
          {asset.tgl_expired && (
            <div className="detail-panel__row"><span>Kadaluarsa</span><span>{asset.tgl_expired}</span></div>
          )}
        </>
      )}
      <div className="detail-panel__actions-row">
        <button onClick={handleMove}>Pindahkan titik</button>
        <button className="detail-panel__delete" onClick={handleDelete}>Lepas dari peta</button>
      </div>
    </div>
  )
}
