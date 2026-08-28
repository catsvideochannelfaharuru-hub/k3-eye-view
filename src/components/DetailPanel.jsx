import { useMemo } from 'react'
import { useAppStore, STATUS_META } from '../store/useAppStore'
import { MARKER_TYPE_META, ZONE_TYPE_META, enrichPoints } from '../lib/categoryHelpers'
import { deletePoint, updateMarkerLabel, updateMarkerDirection } from '../lib/k3PointsApi'
import { deleteRoute } from '../lib/evacuationApi'
import { deleteZone } from '../lib/hazardZonesApi'

export default function DetailPanel() {
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const enrichedPoints = useMemo(() => enrichPoints(points, assets), [points, assets])
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const selectedRouteId = useAppStore((s) => s.selectedRouteId)
  const selectedZoneId = useAppStore((s) => s.selectedZoneId)
  const routes = useAppStore((s) => s.routes)
  const zones = useAppStore((s) => s.zones)
  const startPlaceAsset = useAppStore((s) => s.startPlaceAsset)
  const startPlaceMarker = useAppStore((s) => s.startPlaceMarker)

  const point = enrichedPoints.find((p) => p.id === selectedPointId)
  const route = routes.find((r) => r.id === selectedRouteId)
  const zone = zones.find((z) => z.id === selectedZoneId)

  if (route) {
    return (
      <div className="detail-panel">
        <div className="detail-panel__header"><span className="layer-row__icon">➰</span><span>Jalur Evakuasi</span></div>
        <div className="detail-panel__room">{route.label || '(tanpa nama)'}</div>
        <div className="detail-panel__row"><span>Jumlah titik</span><span>{route.points.length}</span></div>
        <div className="detail-panel__icon-actions">
          <button
            className="icon-btn icon-btn--danger"
            title="Hapus jalur"
            onClick={async () => {
              if (confirm('Hapus jalur evakuasi ini?')) await deleteRoute(route.id)
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    )
  }

  if (zone) {
    const meta = ZONE_TYPE_META[zone.zone_type]
    return (
      <div className="detail-panel">
        <div className="detail-panel__header"><span className="layer-row__icon">🟧</span><span>{meta.label}</span></div>
        <div className="detail-panel__room">{zone.label || '(tanpa nama)'}</div>
        <div className="detail-panel__icon-actions">
          <button
            className="icon-btn icon-btn--danger"
            title="Hapus zona"
            onClick={async () => {
              if (confirm('Hapus zona ini?')) await deleteZone(zone.id)
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    )
  }

  if (!point) {
    return (
      <div className="detail-panel detail-panel--empty">
        Klik salah satu titik, jalur, atau zona di denah untuk melihat detailnya.
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
  async function handleDirection() {
    const deg = window.prompt('Arah sorot CCTV dalam derajat:', String(point.direction_deg || 0))
    if (deg === null) return
    await updateMarkerDirection(point.id, Number(deg) || 0)
  }
  async function handleMove() {
    await deletePoint(point.id)
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
        {point.marker_type === 'cctv' && (
          <div className="detail-panel__row"><span>Arah sorot</span><span>{point.direction_deg ?? 0}°</span></div>
        )}
        <div className="detail-panel__icon-actions">
          <button className="icon-btn" title="Ubah label" onClick={handleRename}>✏️</button>
          {point.marker_type === 'cctv' && (
            <button className="icon-btn" title="Ubah arah sorot" onClick={handleDirection}>🧭</button>
          )}
          <button className="icon-btn" title="Pindahkan" onClick={handleMove}>⇄</button>
          <button className="icon-btn icon-btn--danger" title="Hapus" onClick={handleDelete}>🗑️</button>
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
      <div className="detail-panel__icon-actions">
        <button className="icon-btn" title="Pindahkan titik" onClick={handleMove}>⇄</button>
        <button className="icon-btn icon-btn--danger" title="Lepas dari peta" onClick={handleDelete}>🗑️</button>
      </div>
    </div>
  )
}
