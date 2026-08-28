import { supabase } from './supabaseClient'
import { useAppStore } from '../store/useAppStore'

function isDemoMode() {
  return useAppStore.getState().building?.id === 'demo-building'
}
function genLocalId() {
  return 'local-zone-' + Math.random().toString(36).slice(2, 10)
}

export async function saveZone({ floor_id, label, zone_type, points }) {
  const { addZoneLocal } = useAppStore.getState()
  const payload = { floor_id, label: label || null, zone_type, points }

  if (isDemoMode()) {
    addZoneLocal({ id: genLocalId(), ...payload })
    return { error: null }
  }

  const { data, error } = await supabase.from('hazard_zones').insert(payload).select().single()
  if (!error) addZoneLocal(data)
  return { error }
}

export async function deleteZone(id) {
  const { removeZoneLocal } = useAppStore.getState()
  if (isDemoMode() || (typeof id === 'string' && id.startsWith('local-'))) {
    removeZoneLocal(id)
    return { error: null }
  }
  const { error } = await supabase.from('hazard_zones').delete().eq('id', id)
  if (!error) removeZoneLocal(id)
  return { error }
}
