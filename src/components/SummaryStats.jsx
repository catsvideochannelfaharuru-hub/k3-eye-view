import { useAppStore } from '../store/useAppStore'

export default function SummaryStats() {
  const points = useAppStore((s) => s.points)

  const aparJatuhTempo = points.filter(
    (p) => p.category === 'apar' && p.status !== 'ok'
  ).length
  const laporanTerbuka = points.filter(
    (p) => p.category === 'laporan_bahaya' && p.status !== 'ok'
  ).length

  // Kepatuhan pelatihan belum ada sumber datanya di skema —
  // placeholder sampai tabel training/kepatuhan ditentukan.
  const kepatuhanPelatihan = null

  return (
    <div className="summary-stats">
      <div className="stat">
        <div className="stat-label">APAR jatuh tempo</div>
        <div className="stat-value stat-value--danger">{aparJatuhTempo}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Laporan terbuka</div>
        <div className="stat-value stat-value--warning">{laporanTerbuka}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Kepatuhan pelatihan</div>
        <div className="stat-value">{kepatuhanPelatihan ?? '—'}</div>
      </div>
    </div>
  )
}
