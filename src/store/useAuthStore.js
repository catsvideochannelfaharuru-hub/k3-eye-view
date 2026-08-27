import { create } from 'zustand'

// Toggle ini yang dimaksud "on/off guest" — set ke 'false' di .env kalau nanti
// mau matikan opsi tamu (production/go-live), tanpa perlu ubah kode.
export const GUEST_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_GUEST_LOGIN !== 'false'

export const useAuthStore = create((set) => ({
  session: null,
  authLoading: true,
  authError: null,

  setSession: (session) => set({ session, authLoading: false, authError: null }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setAuthError: (authError) => set({ authError, authLoading: false }),
}))
