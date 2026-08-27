import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/useAuthStore'

export default function UserBadge() {
  const session = useAuthStore((s) => s.session)
  if (!session) return null

  const isGuest = session.user?.is_anonymous
  const label = isGuest ? 'Tamu' : session.user?.email

  return (
    <div className="user-badge">
      <span className="user-badge__label">{isGuest ? '👤 ' : ''}{label}</span>
      <button className="user-badge__logout" onClick={() => supabase.auth.signOut()}>
        Keluar
      </button>
    </div>
  )
}
