import { supabase } from './supabaseClient'
import { useAppStore } from '../store/useAppStore'

function isDemoMode() {
  return useAppStore.getState().building?.id === 'demo-building'
}
function isLocalId(id) {
  return typeof id === 'string' && id.startsWith('local-')
}
function genLocalId() {
  return 'local-' + Math.random().toString(36).slice(2, 10)
}

// --- Titik yang nempel ke asset (asset_id terisi) ---
export async function placeAssetPoint({ floor_id, asset_id, pos_x, pos_y }) {
  const { addPointLocal } = useAppStore.getState()
  const payload = { floor_id, asset_id, marker_type: null, label: null, pos_x, pos_y }

  if (isDemoMode()) {
    addPointLocal({ id: genLocalId(), ...payload })
    return { error: null }
  }

  const { data, error } = await supabase.from('k3_points').insert(payload).select().single()
  if (!error) addPointLocal(data)
  return { error }
}

// --- Marker manual (emergency exit / assembly point / cctv) ---
export async function placeMarkerPoint({ floor_id, marker_type, label, pos_x, pos_y, direction_deg }) {
  const { addPointLocal } = useAppStore.getState()
  const payload = {
    floor_id,
    asset_id: null,
    marker_type,
    label,
    pos_x,
    pos_y,
    direction_deg: direction_deg ?? null,
  }

  if (isDemoMode()) {
    addPointLocal({ id: genLocalId(), ...payload })
    return { error: null }
  }

  const { data, error } = await supabase.from('k3_points').insert(payload).select().single()
  if (!error) addPointLocal(data)
  return { error }
}

export async function updateMarkerDirection(id, direction_deg) {
  const { updatePointLocal } = useAppStore.getState()
  if (isDemoMode() || isLocalId(id)) {
    updatePointLocal(id, { direction_deg })
    return { error: null }
  }
  const { data, error } = await supabase
    .from('k3_points')
    .update({ direction_deg })
    .eq('id', id)
    .select()
    .single()
  if (!error) updatePointLocal(id, data)
  return { error }
}

export async function updatePointPosition(id, pos_x, pos_y) {
  const { updatePointLocal } = useAppStore.getState()
  if (isDemoMode() || isLocalId(id)) {
    updatePointLocal(id, { pos_x, pos_y })
    return { error: null }
  }
  const { data, error } = await supabase
    .from('k3_points')
    .update({ pos_x, pos_y })
    .eq('id', id)
    .select()
    .single()
  if (!error) updatePointLocal(id, data)
  return { error }
}

export async function updateMarkerLabel(id, label) {
  const { updatePointLocal } = useAppStore.getState()
  if (isDemoMode() || isLocalId(id)) {
    updatePointLocal(id, { label })
    return { error: null }
  }
  const { data, error } = await supabase
    .from('k3_points')
    .update({ label })
    .eq('id', id)
    .select()
    .single()
  if (!error) updatePointLocal(id, data)
  return { error }
}

export async function deletePoint(id) {
  const { removePointLocal } = useAppStore.getState()
  if (isDemoMode() || isLocalId(id)) {
    removePointLocal(id)
    return { error: null }
  }
  const { error } = await supabase.from('k3_points').delete().eq('id', id)
  if (!error) removePointLocal(id)
  return { error }
}
