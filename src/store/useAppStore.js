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
