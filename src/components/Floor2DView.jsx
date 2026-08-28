import { useMemo, useRef } from 'react'
import { useAppStore, STATUS_META } from '../store/useAppStore'
import ZoomControls from './ZoomControls'
import { placeAssetPoint, placeMarkerPoint } from '../lib/k3PointsApi'
import { saveZone } from '../lib/hazardZonesApi'
import { enrichPoints, ZONE_TYPE_META } from '../lib/categoryHelpers'

export default function Floor2DView() {
  const activeFloor = useAppStore((s) => s.activeFloor())
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const enrichedPoints = useMemo(() => enrichPoints(points, assets), [points, assets])
  const activeCategories = useAppStore((s) => s.activeCategories)
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const selectedRouteId = useAppStore((s) => s.selectedRouteId)
  const selectedZoneId = useAppStore((s) => s.selectedZoneId)
  const selectPoint = useAppStore((s) => s.selectPoint)
  const selectRoute = useAppStore((s) => s.selectRoute)
  const selectZone = useAppStore((s) => s.selectZone)
  const placementMode = useAppStore((s) => s.placementMode)
  const cancelPlacement = useAppStore((s) => s.cancelPlacement)
  const drawingRoute = useAppStore((s) => s.drawingRoute)
  const routeDraft = useAppStore((s) => s.routeDraft)
  const addRouteVertex = useAppStore((s) => s.addRouteVertex)
  const drawingZone = useAppStore((s) => s.drawingZone)
  const zoneDraft = useAppStore((s) => s.zoneDraft)
  const addZoneVertex = useAppStore((s) => s.addZoneVertex)
  const routes = useAppStore((s) => s.routes)
  const zones = useAppStore((s) => s.zones)
  const zoomScale = useAppStore((s) => s.zoomScale)
  const setZoomScale = useAppStore((s) => s.setZoomScale)

  const pinchRef = useRef({ active: false, startDist: 0, startScale: 1 })

  if (!activeFloor) return null

  const floorPoints = enrichedPoints.filter(
    (p) => p.floor_id === activeFloor.id && activeCategories.includes(p.category)
  )
  const floorRoutes = routes.filter((r) => r.floor_id === activeFloor.id)
  const floorZones = zones.filter((z) => z.floor_id === activeFloor.id && activeCategories.includes('hazard_zone'))

  async function handleImageClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1)

    if (drawingRoute) {
      addRouteVertex({ x, y })
      return
    }
    if (drawingZone) {
      addZoneVertex({ x, y })
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
      let direction_deg = null
      let label = null
      if (markerType === 'cctv') {
        const deg = window.prompt('Arah sorot CCTV dalam derajat (0 = ke atas/utara, 90 = kanan):', '0')
        direction_deg = deg !== null ? Number(deg) || 0 : 0
        label = window.prompt('Label CCTV (opsional):', '')
      } else {
        label = window.prompt(
          markerType === 'emergency_exit' ? 'Label jalur keluar (opsional):' : 'Label titik kumpul (opsional):'
        )
      }
      await placeMarkerPoint({ floor_id: activeFloor.id, marker_type: markerType, label, pos_x: x, pos_y: y, direction_deg })
      return
    }
  }

  // --- Pinch-to-zoom (touch) ---
  function touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      pinchRef.current = { active: true, startDist: touchDist(e.touches), startScale: zoomScale }
    }
  }
  function handleTouchMove(e) {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault()
      const dist = touchDist(e.touches)
      const ratio = dist / pinchRef.current.startDist
      setZoomScale(pinchRef.current.startScale * ratio)
    }
  }
  function handleTouchEnd(e) {
    if (e.touches.length < 2) pinchRef.current.active = false
  }

  const routePointsAttr = (pts) => pts.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')
  const zonePointsAttr = (pts) => pts.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')
  const interactiveMode = Boolean(drawingRoute || drawingZone || placementMode)

  return (
    <div
      className="floor2d-zoom-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
          <defs>
            <marker id="evac-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#2f9e44" />
            </marker>
          </defs>

          {floorZones.map((z) => {
            const meta = ZONE_TYPE_META[z.zone_type]
            const selected = z.id === selectedZoneId
            return (
              <polygon
                key={z.id}
                points={zonePointsAttr(z.points)}
                className={`hazard-zone ${selected ? 'hazard-zone--selected' : ''}`}
                style={{ fill: meta.color, stroke: meta.color }}
                onClick={(e) => {
                  e.stopPropagation()
                  selectZone(z.id)
                }}
              />
            )
          })}
          {drawingZone && zoneDraft.length > 0 && (
            <polygon points={zonePointsAttr(zoneDraft)} className="hazard-zone hazard-zone--draft" />
          )}

          {floorRoutes.map((r) => (
            <polyline
              key={r.id}
              points={routePointsAttr(r.points)}
              className={`evac-route-line ${r.id === selectedRouteId ? 'evac-route-line--selected' : ''}`}
              markerEnd="url(#evac-arrow)"
              onClick={(e) => {
                e.stopPropagation()
                selectRoute(r.id)
              }}
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
          if (p.marker_type === 'cctv') {
            return (
              <div
                key={p.id}
                className="floor2d__cctv"
                style={{ left: `${p.pos_x * 100}%`, top: `${p.pos_y * 100}%` }}
              >
                <div
                  className="floor2d__cctv-cone"
                  style={{ transform: `translate(-50%,-100%) rotate(${p.direction_deg || 0}deg)` }}
                />
                <button
                  className={`floor2d__marker ${selected ? 'floor2d__marker--selected' : ''}`}
                  title={p.displayLabel}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectPoint(p.id)
                  }}
                >
                  {p.icon}
                </button>
              </div>
            )
          }
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
