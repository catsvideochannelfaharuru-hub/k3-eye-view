import { useAppStore, CATEGORY_META } from '../store/useAppStore'

export default function AddPointToolbar() {
  const addingCategory = useAppStore((s) => s.addingCategory)
  const startAddPoint = useAppStore((s) => s.startAddPoint)
  const cancelAddPoint = useAppStore((s) => s.cancelAddPoint)
  const viewMode = useAppStore((s) => s.viewMode)

  if (viewMode !== '2d') {
    // Penempatan titik baru untuk sekarang hanya lewat mode 2D (lebih presisi)
    return null
  }

  if (addingCategory) {
    return (
      <div className="add-toolbar add-toolbar--active">
        <span>
          Klik di denah untuk taruh titik <strong>{CATEGORY_META[addingCategory].label}</strong>…
        </span>
        <button onClick={cancelAddPoint}>Batal</button>
      </div>
    )
  }

  return (
    <div className="add-toolbar">
      <span>Tambah titik:</span>
      {Object.entries(CATEGORY_META).map(([key, meta]) => (
        <button key={key} onClick={() => startAddPoint(key)}>
          {meta.icon} {meta.label}
        </button>
      ))}
    </div>
  )
}
