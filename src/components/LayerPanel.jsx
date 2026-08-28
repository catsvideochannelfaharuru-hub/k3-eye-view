import { useMemo } from 'react'
import { useAppStore, ALL_CATEGORY_KEYS } from '../store/useAppStore'
import { STANDARD_CATEGORIES, MARKER_TYPE_META, getCategoryMeta, enrichPoints } from '../lib/categoryHelpers'

export default function LayerPanel() {
  const points = useAppStore((s) => s.points)
  const assets = useAppStore((s) => s.assets)
  const enrichedPoints = useMemo(() => enrichPoints(points, assets), [points, assets])
  const activeFloor = useAppStore((s) => s.activeFloor())
  const activeCategories = useAppStore((s) => s.activeCategories)
  const toggleCategory = useAppStore((s) => s.toggleCategory)
  const setAllCategories = useAppStore((s) => s.setAllCategories)
  const zones = useAppStore((s) => s.zones)

  const floorPoints = activeFloor ? enrichedPoints.filter((p) => p.floor_id === activeFloor.id) : []
  const floorZoneCount = activeFloor ? zones.filter((z) => z.floor_id === activeFloor.id).length : 0

  const extraCategories = Array.from(
    new Set(
      floorPoints
        .filter((p) => !p.marker_type && !STANDARD_CATEGORIES.some((c) => c.key === p.category))
        .map((p) => p.category)
    )
  )

  const rows = [
    ...STANDARD_CATEGORIES,
    ...extraCategories.map((c) => getCategoryMeta(c)),
    ...Object.entries(MARKER_TYPE_META).map(([key, meta]) => ({ key, ...meta })),
    { key: 'hazard_zone', label: 'Zona Bahaya', icon: '🟧' },
  ]
  const allKeys = [...ALL_CATEGORY_KEYS, ...extraCategories]
  const allSelected = allKeys.every((k) => activeCategories.includes(k))

  return (
    <div className="layer-panel">
      <div className="layer-panel__section">
        <div className="layer-panel__title-row">
          <div className="layer-panel__title">Layer</div>
          <label className="layer-select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setAllCategories(allSelected ? [] : allKeys)}
            />
            {allSelected ? 'Batal semua' : 'Pilih semua'}
          </label>
        </div>
        {rows.map(({ key, label, icon }) => {
          const count = key === 'hazard_zone' ? floorZoneCount : floorPoints.filter((p) => p.category === key).length
          return (
            <label key={key} className="layer-row">
              <input
                type="checkbox"
                checked={activeCategories.includes(key)}
                onChange={() => toggleCategory(key)}
              />
              <span className="layer-row__icon">{icon}</span>
              <span className="layer-row__label">{label}</span>
              <span className="layer-row__count">{count}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
