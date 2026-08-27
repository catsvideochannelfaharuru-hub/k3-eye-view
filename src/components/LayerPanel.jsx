import { useMemo } from 'react'
import { useAppStore, STATUS_META } from '../store/useAppStore'
import { getCategoryIcon, MARKER_TYPE_META, enrichPoints } from '../lib/categoryHelpers'

export default function LayerPanel() {
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const enrichedPoints = useMemo(() => enrichPoints(points, assets), [points, assets])
  const activeFloor = useAppStore((s) => s.activeFloor())
  const activeCategories = useAppStore((s) => s.activeCategories)
  const toggleCategory = useAppStore((s) => s.toggleCategory)

  const floorPoints = activeFloor ? enrichedPoints.filter((p) => p.floor_id === activeFloor.id) : []
  const categories = Array.from(new Set(floorPoints.map((p) => p.category).filter(Boolean)))
  // Tetap tampilkan kategori aktif walau 0 titik di lantai ini, supaya toggle-nya tidak hilang-hilang
  const allKnown = Array.from(new Set([...categories, ...activeCategories]))

  return (
    <div className="layer-panel">
      <div className="layer-panel__section">
        <div className="layer-panel__title">Layer</div>
        {allKnown.map((cat) => {
          const count = floorPoints.filter((p) => p.category === cat).length
          const icon = MARKER_TYPE_META[cat]?.icon || getCategoryIcon(cat)
          const label = MARKER_TYPE_META[cat]?.label || cat
          return (
            <label key={cat} className="layer-row">
              <input
                type="checkbox"
                checked={activeCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              <span className="layer-row__icon">{icon}</span>
              <span className="layer-row__label">{label}</span>
              <span className="layer-row__count">{count}</span>
            </label>
          )
        })}
      </div>

      <div className="layer-panel__section">
        <div className="layer-panel__title">Status Asset</div>
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
