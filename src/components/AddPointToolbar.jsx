import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { saveRoute } from '../lib/evacuationApi'
import AssetPickerModal from './AssetPickerModal'

export default function AddPointToolbar() {
  const viewMode = useAppStore((s) => s.viewMode)
  const placementMode = useAppStore((s) => s.placementMode)
  const cancelPlacement = useAppStore((s) => s.cancelPlacement)
  const startPlaceMarker = useAppStore((s) => s.startPlaceMarker)
  const drawingRoute = useAppStore((s) => s.drawingRoute)
  const routeDraft = useAppStore((s) => s.routeDraft)
  const startDrawRoute = useAppStore((s) => s.startDrawRoute)
  const undoRouteVertex = useAppStore((s) => s.undoRouteVertex)
  const cancelDrawRoute = useAppStore((s) => s.cancelDrawRoute)
  const activeFloor = useAppStore((s) => s.activeFloor())

  const [pickerOpen, setPickerOpen] = useState(false)

  if (viewMode !== '2d') return null // penempatan & gambar jalur untuk sekarang cuma di 2D

  if (drawingRoute) {
    return (
      <div className="add-toolbar add-toolbar--active">
        <span>Klik di denah untuk tambah titik jalur ({routeDraft.length} titik)…</span>
        <button onClick={undoRouteVertex} disabled={routeDraft.length === 0}>
          Hapus titik terakhir
        </button>
        <button
          disabled={routeDraft.length < 2}
          onClick={async () => {
            const label = window.prompt('Nama jalur (opsional):', '')
            await saveRoute({ floor_id: activeFloor.id, label, points: routeDraft })
            cancelDrawRoute()
          }}
        >
          Selesai & Simpan
        </button>
        <button onClick={cancelDrawRoute}>Batal</button>
      </div>
    )
  }

  if (placementMode) {
    const label =
      placementMode.kind === 'asset'
        ? `asset "${placementMode.asset.nama_perangkat || placementMode.asset.kode_asset}"`
        : placementMode.markerType === 'emergency_exit'
        ? 'Jalur Keluar'
        : 'Titik Kumpul'
    return (
      <div className="add-toolbar add-toolbar--active">
        <span>
          Klik di denah untuk taruh <strong>{label}</strong>…
        </span>
        <button onClick={cancelPlacement}>Batal</button>
      </div>
    )
  }

  return (
    <div className="add-toolbar">
      <span>Tambah:</span>
      <button onClick={() => setPickerOpen(true)}>+ Dari Asset</button>
      <button onClick={() => startPlaceMarker('emergency_exit')}>🚪 Jalur Keluar</button>
      <button onClick={() => startPlaceMarker('assembly_point')}>📍 Titik Kumpul</button>
      <button onClick={startDrawRoute}>➰ Gambar Jalur Evakuasi</button>

      {pickerOpen && <AssetPickerModal onClose={() => setPickerOpen(false)} />}
    </div>
  )
}
