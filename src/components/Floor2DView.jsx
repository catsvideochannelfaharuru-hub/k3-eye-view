import { useAppStore, STATUS_META } from '../store/useAppStore'

export default function Floor2DView() {
  const activeFloor = useAppStore((s) => s.activeFloor())
  const points = useAppStore((s) => s.points)
  const activeCategories = useAppStore((s) => s.activeCategories)
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const selectPoint = useAppStore((s) => s.selectPoint)

  if (!activeFloor) return null

  const floorPoints = points.filter(
    (p) => p.floor_id === activeFloor.id && activeCategories.includes(p.category)
  )

  return (
    <div className="floor2d">
      <img className="floor2d__image" src={activeFloor.image_url} alt={activeFloor.name} />
      {floorPoints.map((p) => {
        const status = STATUS_META[p.status]
        const selected = p.id === selectedPointId
        return (
          <button
            key={p.id}
            className={`floor2d__point ${selected ? 'floor2d__point--selected' : ''}`}
            style={{
              left: `${p.pos_x * 100}%`,
              top: `${p.pos_y * 100}%`,
              background: status.color,
            }}
            title={`${p.room_name || ''} — ${status.label}`}
            onClick={() => selectPoint(p.id)}
          />
        )
      })}
    </div>
  )
}
