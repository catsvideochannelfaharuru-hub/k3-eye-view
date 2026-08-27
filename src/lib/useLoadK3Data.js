import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useAppStore } from '../store/useAppStore'
import { FALLBACK_BUILDING, FALLBACK_FLOORS, FALLBACK_POINTS } from '../data/fallbackData'

export function useLoadK3Data() {
  const setData = useAppStore((s) => s.setData)
  const setError = useAppStore((s) => s.setError)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data: buildings, error: bErr } = await supabase
          .from('buildings')
          .select('*')
          .limit(1)
        if (bErr) throw bErr

        if (!buildings || buildings.length === 0) {
          // Supabase belum diisi (atau belum dikonfigurasi) — pakai data contoh lokal
          if (!cancelled) {
            setData({
              building: FALLBACK_BUILDING,
              floors: FALLBACK_FLOORS,
              points: FALLBACK_POINTS,
            })
          }
          return
        }

        const building = buildings[0]

        const { data: floors, error: fErr } = await supabase
          .from('floors')
          .select('*')
          .eq('building_id', building.id)
          .order('level', { ascending: true })
        if (fErr) throw fErr

        const floorIds = (floors || []).map((f) => f.id)
        const { data: points, error: pErr } = await supabase
          .from('k3_points')
          .select('*')
          .in('floor_id', floorIds.length ? floorIds : ['00000000-0000-0000-0000-000000000000'])
        if (pErr) throw pErr

        if (!cancelled) {
          setData({ building, floors: floors || [], points: points || [] })
        }
      } catch (err) {
        console.warn('[k3] gagal load dari Supabase, pakai data contoh lokal:', err.message)
        if (!cancelled) {
          setData({
            building: FALLBACK_BUILDING,
            floors: FALLBACK_FLOORS,
            points: FALLBACK_POINTS,
          })
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [setData, setError])
}
