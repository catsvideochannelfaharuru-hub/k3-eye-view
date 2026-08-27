import { useAppStore, STATUS_META } from '../store/useAppStore'

export default function Floor2DView() {
  const activeFloor = useAppStore((s) => s.activeFloor())
  const points = useAppStore((s) => s.points)
  const activeCategories = useAppStore((s) => s.activeCategories)
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const selectPoint = useAppStore((s) => s.selectPoint)
  const addingCategory = useAppStore((s) => s.addingCategory)
  const placePoint = useAppStore((s) => s.placePoint)

  if (!activeFloor) return null

  const floorPoints = points.filter(
    (p) => p.floor_id === activeFloor.id && activeCategories.includes(p.category)
  )

  function handleImageClick(e) {
    if (!addingCategory) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    placePoint(Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1))
  }

  return (
    <div className={`floor2d ${addingCategory ? 'floor2d--adding' : ''}`}>
      <img
        className="floor2d__image"
        src={activeFloor.image_url}
        alt={activeFloor.name}
        onClick={handleImageClick}
      />
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
            onClick={(e) => {
              e.stopPropagation()
              selectPoint(p.id)
            }}
          />
        )
      })}
    </div>
  )
}
