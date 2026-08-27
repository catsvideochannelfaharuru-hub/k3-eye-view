import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { GUEST_LOGIN_ENABLED } from '../store/useAuthStore'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setInfo(null)

    const action =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

    const { error: authError } = await action
    setSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }
    if (mode === 'signup') {
      setInfo('Akun dibuat. Cek email kamu untuk verifikasi, lalu login.')
    }
  }

  async function handleGuest() {
    setSubmitting(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInAnonymously()
    setSubmitting(false)
    if (authError) {
      setError(
        'Gagal masuk sebagai tamu — pastikan "Allow anonymous sign-ins" aktif di ' +
          'Supabase Dashboard > Authentication > Sign In / Providers. (' +
          authError.message +
          ')'
      )
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>K3 Eye View</h1>
        <p className="auth-subtitle">
          {mode === 'signin' ? 'Masuk untuk mengelola data K3' : 'Buat akun baru'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Memproses…' : mode === 'signin' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setInfo(null)
          }}
        >
          {mode === 'signin' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>

        {GUEST_LOGIN_ENABLED && (
          <>
            <div className="auth-divider">atau</div>
            <button className="auth-guest" onClick={handleGuest} disabled={submitting}>
              Masuk sebagai Tamu (mode development)
            </button>
            <p className="auth-guest-note">
              Tombol ini untuk uji coba selama development — matikan dengan
              <code> VITE_ENABLE_GUEST_LOGIN=false </code> sebelum go-live.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
