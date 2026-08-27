import { useAppStore } from '../store/useAppStore'

export default function ViewModeToggle() {
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)

  return (
    <div className="view-toggle">
      <button
        className={viewMode === '2d' ? 'active' : ''}
        onClick={() => setViewMode('2d')}
      >
        2D
      </button>
      <button
        className={viewMode === '3d' ? 'active' : ''}
        onClick={() => setViewMode('3d')}
      >
        3D
      </button>
    </div>
  )
}
