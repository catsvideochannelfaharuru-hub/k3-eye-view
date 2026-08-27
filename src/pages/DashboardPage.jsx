import { useAppStore } from '../store/useAppStore'
import { useLoadK3Data } from '../lib/useLoadK3Data'
import FloorTabs from '../components/FloorTabs'
import LayerPanel from '../components/LayerPanel'
import DetailPanel from '../components/DetailPanel'
import Floor2DView from '../components/Floor2DView'
import Floor3DView from '../components/Floor3DView'
import ViewModeToggle from '../components/ViewModeToggle'
import UserBadge from '../components/UserBadge'
import AddPointToolbar from '../components/AddPointToolbar'

export default function DashboardPage() {
  useLoadK3Data()

  const loading = useAppStore((s) => s.loading)
  const building = useAppStore((s) => s.building)
  const viewMode = useAppStore((s) => s.viewMode)

  if (loading) {
    return <div className="app-loading">Memuat data K3…</div>
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>K3 Eye View</h1>
        <FloorTabs />
        <ViewModeToggle />
        <UserBadge />
      </header>

      {building?.id === 'demo-building' && (
        <div className="demo-banner">
          Menampilkan data contoh lokal — hubungkan project Supabase kamu (isi <code>.env</code>)
          untuk data sungguhan dari <code>assets_k3</code>. Perubahan lewat toolbar tambah di
          bawah tetap bisa dicoba, tapi hanya tersimpan sementara di layar ini.
        </div>
      )}

      <AddPointToolbar />

      <div className="app-body">
        <LayerPanel />
        <div className="app-main">
          {viewMode === '2d' ? <Floor2DView /> : <Floor3DView />}
        </div>
        <DetailPanel />
      </div>
    </div>
  )
}
