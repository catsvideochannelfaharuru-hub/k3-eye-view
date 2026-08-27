import { useAppStore, CATEGORY_META, STATUS_META } from '../store/useAppStore'

export default function LayerPanel() {
  const points = useAppStore((s) => s.points)
  const activeFloor = useAppStore((s) => s.activeFloor())
  const activeCategories = useAppStore((s) => s.activeCategories)
  const toggleCategory = useAppStore((s) => s.toggleCategory)

  const floorPoints = activeFloor ? points.filter((p) => p.floor_id === activeFloor.id) : []

  return (
    <div className="layer-panel">
      <div className="layer-panel__section">
        <div className="layer-panel__title">Layer</div>
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const count = floorPoints.filter((p) => p.category === key).length
          return (
            <label key={key} className="layer-row">
              <input
                type="checkbox"
                checked={activeCategories.includes(key)}
                onChange={() => toggleCategory(key)}
              />
              <span className="layer-row__icon">{meta.icon}</span>
              <span className="layer-row__label">{meta.label}</span>
              <span className="layer-row__count">{count}</span>
            </label>
          )
        })}
      </div>

      <div className="layer-panel__section">
        <div className="layer-panel__title">Status</div>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="status-row">
            <span className="status-dot" style={{ background: meta.color }} />
            <span>{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
