import { useAppStore, CATEGORY_META, STATUS_META } from '../store/useAppStore'

export default function DetailPanel() {
  const points = useAppStore((s) => s.points)
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const point = points.find((p) => p.id === selectedPointId)

  if (!point) {
    return (
      <div className="detail-panel detail-panel--empty">
        Klik salah satu titik di denah untuk melihat detailnya.
      </div>
    )
  }

  const cat = CATEGORY_META[point.category]
  const status = STATUS_META[point.status]

  return (
    <div className="detail-panel">
      <div className="detail-panel__header">
        <span className="layer-row__icon">{cat.icon}</span>
        <span>{cat.label}</span>
      </div>
      <div className="detail-panel__room">{point.room_name || 'Tanpa nama ruangan'}</div>
      <div className="detail-panel__status">
        <span className="status-dot" style={{ background: status.color }} />
        {status.label}
      </div>
      {point.due_date && (
        <div className="detail-panel__row">
          <span>Jatuh tempo</span>
          <span>{point.due_date}</span>
        </div>
      )}
      {point.notes && (
        <div className="detail-panel__notes">{point.notes}</div>
      )}
    </div>
  )
}
