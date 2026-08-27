import { useMemo } from 'react'
import { useAppStore, STATUS_META } from '../store/useAppStore'
import ZoomControls from './ZoomControls'
import { placeAssetPoint, placeMarkerPoint } from '../lib/k3PointsApi'
import { enrichPoints } from '../lib/categoryHelpers'

export default function Floor2DView() {
  const activeFloor = useAppStore((s) => s.activeFloor())
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const enrichedPoints = useMemo(() => enrichPoints(points, assets), [points, assets])
  const activeCategories = useAppStore((s) => s.activeCategories)
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const selectPoint = useAppStore((s) => s.selectPoint)
  const placementMode = useAppStore((s) => s.placementMode)
  const cancelPlacement = useAppStore((s) => s.cancelPlacement)
  const drawingRoute = useAppStore((s) => s.drawingRoute)
  const routeDraft = useAppStore((s) => s.routeDraft)
  const addRouteVertex = useAppStore((s) => s.addRouteVertex)
  const routes = useAppStore((s) => s.routes)
  const zoomScale = useAppStore((s) => s.zoomScale)

  if (!activeFloor) return null

  const floorPoints = enrichedPoints.filter(
    (p) => p.floor_id === activeFloor.id && activeCategories.includes(p.category)
  )
  const floorRoutes = routes.filter((r) => r.floor_id === activeFloor.id)

  async function handleImageClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1)

    if (drawingRoute) {
      addRouteVertex({ x, y })
      return
    }
    if (placementMode?.kind === 'asset') {
      const asset = placementMode.asset
      cancelPlacement()
      await placeAssetPoint({ floor_id: activeFloor.id, asset_id: asset.id, pos_x: x, pos_y: y })
      return
    }
    if (placementMode?.kind === 'marker') {
      const markerType = placementMode.markerType
      cancelPlacement()
      const label = window.prompt(
        markerType === 'emergency_exit' ? 'Label jalur keluar (opsional):' : 'Label titik kumpul (opsional):'
      )
      await placeMarkerPoint({ floor_id: activeFloor.id, marker_type: markerType, label, pos_x: x, pos_y: y })
      return
    }
  }

  const interactiveMode = Boolean(drawingRoute || placementMode)
  const routePointsAttr = (pts) => pts.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')

  return (
    <div className="floor2d-zoom-container">
      <ZoomControls />
      <div
        className={`floor2d ${interactiveMode ? 'floor2d--adding' : ''}`}
        style={{ width: `${zoomScale * 100}%` }}
      >
        <img
          className="floor2d__image"
          src={activeFloor.image_url}
          alt={activeFloor.name}
          onClick={handleImageClick}
        />

        <svg className="floor2d__routes" viewBox="0 0 100 100" preserveAspectRatio="none">
          {floorRoutes.map((r) => (
            <polyline
              key={r.id}
              points={routePointsAttr(r.points)}
              className="evac-route-line"
            />
          ))}
          {drawingRoute && routeDraft.length > 0 && (
            <polyline points={routePointsAttr(routeDraft)} className="evac-route-line evac-route-line--draft" />
          )}
          {drawingRoute &&
            routeDraft.map((p, i) => (
              <circle key={i} cx={p.x * 100} cy={p.y * 100} r={0.8} className="evac-route-vertex" />
            ))}
        </svg>

        {floorPoints.map((p) => {
          const selected = p.id === selectedPointId
          if (p.marker_type) {
            return (
              <button
                key={p.id}
                className={`floor2d__marker ${selected ? 'floor2d__marker--selected' : ''}`}
                style={{ left: `${p.pos_x * 100}%`, top: `${p.pos_y * 100}%` }}
                title={p.displayLabel}
                onClick={(e) => {
                  e.stopPropagation()
                  selectPoint(p.id)
                }}
              >
                {p.icon}
              </button>
            )
          }
          const status = STATUS_META[p.status]
          return (
            <button
              key={p.id}
              className={`floor2d__point ${selected ? 'floor2d__point--selected' : ''}`}
              style={{
                left: `${p.pos_x * 100}%`,
                top: `${p.pos_y * 100}%`,
                background: status.color,
              }}
              title={`${p.displayLabel} — ${status.label}`}
              onClick={(e) => {
                e.stopPropagation()
                selectPoint(p.id)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
