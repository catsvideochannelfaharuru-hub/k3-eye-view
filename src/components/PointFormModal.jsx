import { useState, useEffect } from 'react'
import { useAppStore, CATEGORY_META } from '../store/useAppStore'
import { createPoint, updatePoint, deletePoint } from '../lib/k3PointsApi'

export default function PointFormModal() {
  const formOpen = useAppStore((s) => s.formOpen)
  const formMode = useAppStore((s) => s.formMode)
  const formInitial = useAppStore((s) => s.formInitial)
  const closeForm = useAppStore((s) => s.closeForm)
  const activeFloor = useAppStore((s) => s.activeFloor())

  const [values, setValues] = useState(formInitial || {})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Reset isi form tiap kali target berubah (dibuka untuk titik/posisi baru)
  useEffect(() => {
    setValues(formInitial || {})
    setError(null)
  }, [formInitial])

  if (!formOpen || !formInitial) return null

  function set(field, val) {
    setValues((v) => ({ ...v, [field]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      floor_id: activeFloor.id,
      category: values.category,
      room_name: values.room_name || null,
      pos_x: values.pos_x,
      pos_y: values.pos_y,
      status: values.status,
      due_date: values.due_date || null,
      notes: values.notes || null,
    }

    const { error: err } =
      formMode === 'add' ? await createPoint(payload) : await updatePoint(formInitial.id, payload)

    setSubmitting(false)
    if (err) setError(err.message)
  }

  async function handleDelete() {
    if (!confirm('Hapus titik ini?')) return
    setSubmitting(true)
    const { error: err } = await deletePoint(formInitial.id)
    setSubmitting(false)
    if (err) setError(err.message)
  }

  return (
    <div className="modal-backdrop" onClick={closeForm}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{formMode === 'add' ? 'Tambah Titik' : 'Edit Titik'}</h2>
        <div className="modal-category">
          {CATEGORY_META[values.category]?.icon} {CATEGORY_META[values.category]?.label}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Nama ruangan
            <input
              type="text"
              value={values.room_name || ''}
              onChange={(e) => set('room_name', e.target.value)}
              placeholder="misal: Farmasi"
            />
          </label>

          <label>
            Status
            <select value={values.status} onChange={(e) => set('status', e.target.value)}>
              <option value="ok">OK</option>
              <option value="jatuh_tempo_dekat">Jatuh tempo dekat</option>
              <option value="lewat_jatuh_tempo">Lewat jatuh tempo</option>
            </select>
          </label>

          <label>
            Jatuh tempo
            <input
              type="date"
              value={values.due_date || ''}
              onChange={(e) => set('due_date', e.target.value)}
            />
          </label>

          <label>
            Catatan
            <textarea
              value={values.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <div className="modal-actions">
            {formMode === 'edit' && (
              <button
                type="button"
                className="modal-delete"
                onClick={handleDelete}
                disabled={submitting}
              >
                Hapus
              </button>
            )}
            <div className="modal-actions__right">
              <button type="button" onClick={closeForm} disabled={submitting}>
                Batal
              </button>
              <button type="submit" className="modal-save" disabled={submitting}>
                {submitting ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
