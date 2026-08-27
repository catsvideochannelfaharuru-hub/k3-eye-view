import { supabase } from './supabaseClient'
import { useAppStore } from '../store/useAppStore'

function isDemoMode() {
  return useAppStore.getState().building?.id === 'demo-building'
}
function genLocalId() {
  return 'local-route-' + Math.random().toString(36).slice(2, 10)
}

export async function saveRoute({ floor_id, label, points }) {
  const { addRouteLocal } = useAppStore.getState()
  const payload = { floor_id, label: label || null, points }

  if (isDemoMode()) {
    addRouteLocal({ id: genLocalId(), ...payload })
    return { error: null }
  }

  const { data, error } = await supabase.from('evacuation_routes').insert(payload).select().single()
  if (!error) addRouteLocal(data)
  return { error }
}

export async function deleteRoute(id) {
  const { removeRouteLocal } = useAppStore.getState()
  if (isDemoMode() || (typeof id === 'string' && id.startsWith('local-'))) {
    removeRouteLocal(id)
    return { error: null }
  }
  const { error } = await supabase.from('evacuation_routes').delete().eq('id', id)
  if (!error) removeRouteLocal(id)
  return { error }
}
