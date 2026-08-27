import { useAuthSession } from './lib/useAuthSession'
import { useAuthStore } from './store/useAuthStore'
import AuthScreen from './components/AuthScreen'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  useAuthSession()

  const session = useAuthStore((s) => s.session)
  const authLoading = useAuthStore((s) => s.authLoading)

  if (authLoading) {
    return <div className="app-loading">Memeriksa sesi login…</div>
  }

  if (!session) {
    return <AuthScreen />
  }

  return <DashboardPage />
}
