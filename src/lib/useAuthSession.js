import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useAuthStore } from '../store/useAuthStore'

export function useAuthSession() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [setSession])
}
