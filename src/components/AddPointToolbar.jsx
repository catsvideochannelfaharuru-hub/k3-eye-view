import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { saveRoute } from '../lib/evacuationApi'
import { saveZone } from '../lib/hazardZonesApi'
import AssetPickerModal from './AssetPickerModal'

export default function AddMappingAccordion() {
  const viewMode = useAppStore((s) => s.viewMode)
  const addMappingOpen = useAppStore((s) => s.addMappingOpen)
  const setAddMappingOpen = useAppStore((s) => s.setAddMappingOpen)
  const placementMode = useAppStore((s) => s.placementMode)
  const cancelPlacement = useAppStore((s) => s.cancelPlacement)
  const startPlaceMarker = useAppStore((s) => s.startPlaceMarker)
  const drawingRoute = useAppStore((s) => s.drawingRoute)
  const routeDraft = useAppStore((s) => s.routeDraft)
  const startDrawRoute = useAppStore((s) => s.startDrawRoute)
  const undoRouteVertex = useAppStore((s) => s.undoRouteVertex)
  const cancelDrawRoute = useAppStore((s) => s.cancelDrawRoute)
  const drawingZone = useAppStore((s) => s.drawingZone)
  const zoneDraft = useAppStore((s) => s.zoneDraft)
  const startDrawZone = useAppStore((s) => s.startDrawZone)
  const undoZoneVertex = useAppStore((s) => s.undoZoneVertex)
  const cancelDrawZone = useAppStore((s) => s.cancelDrawZone)
  const activeFloor = useAppStore((s) => s.activeFloor())

  const [pickerOpen, setPickerOpen] = useState(false)

  if (viewMode !== '2d') return null

  const busy = drawingRoute || drawingZone || placementMode

  return (
    <div className="accordion">
      <button className="accordion__header" onClick={() => setAddMappingOpen(!addMappingOpen)}>
        <span>➕ Tambah Mapping</span>
        <span className={`accordion__chevron ${addMappingOpen ? 'open' : ''}`}>▾</span>
      </button>

      {addMappingOpen && (
        <div className="accordion__body">
          {drawingRoute && (
            <div className="add-toolbar add-toolbar--active add-toolbar--vertical">
              <span>Klik di denah untuk tambah titik jalur ({routeDraft.length} titik)…</span>
              <button onClick={undoRouteVertex} disabled={routeDraft.length === 0}>Hapus titik terakhir</button>
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
          )}

          {drawingZone && (
            <div className="add-toolbar add-toolbar--active add-toolbar--vertical">
              <span>
                Klik di denah untuk gambar <strong>{drawingZone === 'risk' ? 'Zona Berisiko' : 'Zona Berbahaya'}</strong> ({zoneDraft.length} titik)…
              </span>
              <button onClick={undoZoneVertex} disabled={zoneDraft.length === 0}>Hapus titik terakhir</button>
              <button
                disabled={zoneDraft.length < 3}
                onClick={async () => {
                  const label = window.prompt('Nama zona (opsional):', '')
                  await saveZone({ floor_id: activeFloor.id, label, zone_type: drawingZone, points: zoneDraft })
                  cancelDrawZone()
                }}
              >
                Selesai & Simpan
              </button>
              <button onClick={cancelDrawZone}>Batal</button>
            </div>
          )}

          {placementMode && (
            <div className="add-toolbar add-toolbar--active add-toolbar--vertical">
              <span>
                Klik di denah untuk taruh{' '}
                <strong>
                  {placementMode.kind === 'asset'
                    ? `asset "${placementMode.asset.nama_perangkat || placementMode.asset.kode_asset}"`
                    : placementMode.markerType === 'emergency_exit'
                    ? 'Jalur Keluar'
                    : placementMode.markerType === 'assembly_point'
                    ? 'Titik Kumpul'
                    : 'CCTV'}
                </strong>
                …
              </span>
              <button onClick={cancelPlacement}>Batal</button>
            </div>
          )}

          {!busy && (
            <div className="add-mapping-list">
              <button onClick={() => setPickerOpen(true)}>+ Dari Asset</button>
              <button onClick={() => startPlaceMarker('emergency_exit')}>🚪 Jalur Keluar</button>
              <button onClick={() => startPlaceMarker('assembly_point')}>📍 Titik Kumpul</button>
              <button onClick={() => startPlaceMarker('cctv')}>📷 CCTV</button>
              <button onClick={startDrawRoute}>➰ Gambar Jalur Evakuasi</button>
              <button onClick={() => startDrawZone('risk')}>🟧 Zona Berisiko</button>
              <button onClick={() => startDrawZone('danger')}>🟥 Zona Berbahaya</button>
            </div>
          )}
        </div>
      )}

      {pickerOpen && <AssetPickerModal onClose={() => setPickerOpen(false)} />}
    </div>
  )
}
