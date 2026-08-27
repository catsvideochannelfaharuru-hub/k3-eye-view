import { supabase } from './supabaseClient'
import { useAppStore } from '../store/useAppStore'

function isDemoMode() {
  return useAppStore.getState().building?.id === 'demo-building'
}

function genLocalId() {
  return 'local-' + Math.random().toString(36).slice(2, 10)
}

export async function createPoint(data) {
  const { addPointLocal, closeForm } = useAppStore.getState()

  if (isDemoMode()) {
    addPointLocal({ id: genLocalId(), ...data })
    closeForm()
    return { error: null }
  }

  const { data: inserted, error } = await supabase
    .from('k3_points')
    .insert(data)
    .select()
    .single()

  if (!error) {
    addPointLocal(inserted)
    closeForm()
  }
  return { error }
}

export async function updatePoint(id, patch) {
  const { updatePointLocal, closeForm } = useAppStore.getState()

  if (isDemoMode() || id.startsWith('local-')) {
    updatePointLocal(id, patch)
    closeForm()
    return { error: null }
  }

  const { data: updated, error } = await supabase
    .from('k3_points')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (!error) {
    updatePointLocal(id, updated)
    closeForm()
  }
  return { error }
}

export async function deletePoint(id) {
  const { removePointLocal, closeForm } = useAppStore.getState()

  if (isDemoMode() || id.startsWith('local-')) {
    removePointLocal(id)
    closeForm()
    return { error: null }
  }

  const { error } = await supabase.from('k3_points').delete().eq('id', id)
  if (!error) {
    removePointLocal(id)
    closeForm()
  }
  return { error }
}
