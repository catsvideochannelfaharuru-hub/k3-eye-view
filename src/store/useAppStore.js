import { create } from 'zustand'

export const CATEGORY_META = {
  apar: { label: 'APAR', icon: '🧯' },
  hydrant: { label: 'Hydrant', icon: '💧' },
  detektor_asap: { label: 'Detektor asap', icon: '🔔' },
  laporan_bahaya: { label: 'Laporan bahaya', icon: '⚠️' },
}

export const STATUS_META = {
  ok: { label: 'OK', color: '#2f9e44' },
  jatuh_tempo_dekat: { label: 'Jatuh tempo dekat', color: '#f2994a' },
  lewat_jatuh_tempo: { label: 'Lewat jatuh tempo', color: '#e03131' },
}

export const useAppStore = create((set, get) => ({
  viewMode: '2d', // '2d' | '3d'
  building: null,
  floors: [],
  activeFloorLevel: 1,
  points: [], // semua titik k3 (semua lantai), difilter per komponen saat dipakai
  activeCategories: Object.keys(CATEGORY_META),
  selectedPointId: null,
  loading: true,
  error: null,

  // --- state untuk tambah/edit titik (CRUD) ---
  addingCategory: null, // string kategori kalau sedang mode "klik di denah untuk taruh titik", null kalau tidak
  formOpen: false,
  formMode: 'add', // 'add' | 'edit'
  formInitial: null, // data awal form (posisi utk add, data titik utk edit)

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFloorLevel: (level) => set({ activeFloorLevel: level, selectedPointId: null }),
  toggleCategory: (cat) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(cat)
        ? state.activeCategories.filter((c) => c !== cat)
        : [...state.activeCategories, cat],
    })),
  selectPoint: (id) => set({ selectedPointId: id }),

  setData: ({ building, floors, points }) => set({ building, floors, points, loading: false }),
  setError: (error) => set({ error, loading: false }),

  // --- actions CRUD ---
  startAddPoint: (category) => set({ addingCategory: category, selectedPointId: null }),
  cancelAddPoint: () => set({ addingCategory: null }),

  placePoint: (posX, posY) => {
    const state = get()
    if (!state.addingCategory) return
    set({
      formOpen: true,
      formMode: 'add',
      formInitial: {
        category: state.addingCategory,
        pos_x: posX,
        pos_y: posY,
        room_name: '',
        status: 'ok',
        due_date: '',
        notes: '',
      },
      addingCategory: null,
    })
  },

  openEditForm: (point) =>
    set({ formOpen: true, formMode: 'edit', formInitial: point, selectedPointId: point.id }),

  closeForm: () => set({ formOpen: false, formInitial: null }),

  addPointLocal: (point) => set((state) => ({ points: [...state.points, point] })),
  updatePointLocal: (id, patch) =>
    set((state) => ({
      points: state.points.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removePointLocal: (id) =>
    set((state) => ({
      points: state.points.filter((p) => p.id !== id),
      selectedPointId: state.selectedPointId === id ? null : state.selectedPointId,
    })),

  activeFloor: () => {
    const state = get()
    return state.floors.find((f) => f.level === state.activeFloorLevel) || null
  },
  visiblePoints: (floorId) => {
    const state = get()
    return state.points.filter(
      (p) => p.floor_id === floorId && state.activeCategories.includes(p.category)
    )
  },
}))
