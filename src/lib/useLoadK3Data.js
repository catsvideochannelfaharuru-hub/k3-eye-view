import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useAppStore } from '../store/useAppStore'
import {
  FALLBACK_BUILDING,
  FALLBACK_FLOORS,
  FALLBACK_ASSETS,
  FALLBACK_POINTS,
  FALLBACK_ROUTES,
} from '../data/fallbackData'

function useFallback(setData) {
  setData({
    building: FALLBACK_BUILDING,
    floors: FALLBACK_FLOORS,
    assets: FALLBACK_ASSETS,
    points: FALLBACK_POINTS,
    routes: FALLBACK_ROUTES,
  })
}

export function useLoadK3Data() {
  const setData = useAppStore((s) => s.setData)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data: buildings, error: bErr } = await supabase.from('buildings').select('*').limit(1)
        if (bErr) throw bErr
        if (!buildings || buildings.length === 0) {
          if (!cancelled) useFallback(setData)
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
        const emptyFloorGuard = floorIds.length ? floorIds : ['00000000-0000-0000-0000-000000000000']

        const [{ data: assets, error: aErr }, { data: points, error: pErr }, { data: routes, error: rErr }] =
          await Promise.all([
            supabase.from('assets_k3').select('*'),
            supabase.from('k3_points').select('*').in('floor_id', emptyFloorGuard),
            supabase.from('evacuation_routes').select('*').in('floor_id', emptyFloorGuard),
          ])
        if (aErr) throw aErr
        if (pErr) throw pErr
        if (rErr) throw rErr

        if (!cancelled) {
          setData({
            building,
            floors: floors || [],
            assets: assets || [],
            points: points || [],
            routes: routes || [],
          })
        }
      } catch (err) {
        console.warn('[k3] gagal load dari Supabase, pakai data contoh lokal:', err.message)
        if (!cancelled) useFallback(setData)
      }
    }

    load().catch((err) => {
      console.error('[k3] load() gagal total, fallback ke data lokal:', err)
      if (!cancelled) useFallback(setData)
    })
    return () => {
      cancelled = true
    }
  }, [setData])
}
