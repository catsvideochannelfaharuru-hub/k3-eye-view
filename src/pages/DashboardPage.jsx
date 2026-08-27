import { useAppStore } from '../store/useAppStore'
import { useLoadK3Data } from '../lib/useLoadK3Data'
import FloorTabs from '../components/FloorTabs'
import SummaryStats from '../components/SummaryStats'
import LayerPanel from '../components/LayerPanel'
import DetailPanel from '../components/DetailPanel'
import Floor2DView from '../components/Floor2DView'
import Floor3DView from '../components/Floor3DView'
import ViewModeToggle from '../components/ViewModeToggle'
import UserBadge from '../components/UserBadge'
import AddPointToolbar from '../components/AddPointToolbar'
import PointFormModal from '../components/PointFormModal'

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
          dan tambahkan data ke tabel <code>buildings</code>/<code>floors</code>/<code>k3_points</code>
          untuk data sungguhan. Perubahan lewat form tambah/edit di bawah tetap bisa dicoba,
          tapi hanya tersimpan sementara di layar ini (tidak ke database).
        </div>
      )}

      <SummaryStats />
      <AddPointToolbar />

      <div className="app-body">
        <LayerPanel />
        <div className="app-main">
          {viewMode === '2d' ? <Floor2DView /> : <Floor3DView />}
        </div>
        <DetailPanel />
      </div>

      <PointFormModal />
    </div>
  )
}
