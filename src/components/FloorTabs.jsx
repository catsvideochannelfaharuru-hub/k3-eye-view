import { useAppStore } from '../store/useAppStore'

export default function FloorTabs() {
  const floors = useAppStore((s) => s.floors)
  const activeFloorLevel = useAppStore((s) => s.activeFloorLevel)
  const setActiveFloorLevel = useAppStore((s) => s.setActiveFloorLevel)

  return (
    <div className="floor-tabs">
      {floors
        .slice()
        .sort((a, b) => a.level - b.level)
        .map((f) => (
          <button
            key={f.id}
            className={`floor-tab ${f.level === activeFloorLevel ? 'active' : ''}`}
            onClick={() => setActiveFloorLevel(f.level)}
          >
            {f.name}
          </button>
        ))}
    </div>
  )
}
