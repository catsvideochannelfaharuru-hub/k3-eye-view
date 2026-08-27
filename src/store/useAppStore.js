import { create } from 'zustand'


export const useAppStore = create((set, get) => ({
  viewMode: '2d', // '2d' | '3d'
  building: null,
  floors: [],
  activeFloorLevel: 1,

  assets: [], // semua baris assets_k3
  points: [], // k3_points mentah: {id, floor_id, asset_id, marker_type, label, pos_x, pos_y}
  routes: [], // evacuation_routes: {id, floor_id, label, points:[{x,y}]}

  activeCategories: [], // diisi otomatis begitu data asset termuat (lihat setData)
  selectedPointId: null,
  loading: true,
  error: null,

  // --- mode "tambah" ---
  placementMode: null, // null | { kind: 'asset', asset } | { kind: 'marker', markerType }
  drawingRoute: false,
  routeDraft: [], // [{x,y}, ...] sementara saat menggambar jalur

  zoomScale: 1,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFloorLevel: (level) =>
    set({ activeFloorLevel: level, selectedPointId: null, zoomScale: 1 }),
  toggleCategory: (cat) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(cat)
        ? state.activeCategories.filter((c) => c !== cat)
        : [...state.activeCategories, cat],
    })),
  selectPoint: (id) => set({ selectedPointId: id }),
  setZoomScale: (zoomScale) => set({ zoomScale: Math.min(Math.max(zoomScale, 1), 4) }),

  setData: ({ building, floors, assets, points, routes }) => {
    const categories = Array.from(new Set(assets.map((a) => a.kategori))).filter(Boolean)
    const allCats = [...categories, 'emergency_exit', 'assembly_point']
    set({ building, floors, assets, points, routes, loading: false, activeCategories: allCats })
  },
  setError: (error) => set({ error, loading: false }),

  activeFloor: () => {
    const state = get()
    return state.floors.find((f) => f.level === state.activeFloorLevel) || null
  },

  // --- actions mode tambah/placement ---
  startPlaceAsset: (asset) => set({ placementMode: { kind: 'asset', asset }, drawingRoute: false }),
  startPlaceMarker: (markerType) =>
    set({ placementMode: { kind: 'marker', markerType }, drawingRoute: false }),
  cancelPlacement: () => set({ placementMode: null }),

  startDrawRoute: () => set({ drawingRoute: true, routeDraft: [], placementMode: null }),
  addRouteVertex: (pt) => set((state) => ({ routeDraft: [...state.routeDraft, pt] })),
  undoRouteVertex: () => set((state) => ({ routeDraft: state.routeDraft.slice(0, -1) })),
  cancelDrawRoute: () => set({ drawingRoute: false, routeDraft: [] }),

  // --- CRUD lokal (dipanggil dari lib/*Api.js setelah sukses ke Supabase / demo) ---
  addPointLocal: (point) => set((state) => ({ points: [...state.points, point] })),
  updatePointLocal: (id, patch) =>
    set((state) => ({ points: state.points.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removePointLocal: (id) =>
    set((state) => ({
      points: state.points.filter((p) => p.id !== id),
      selectedPointId: state.selectedPointId === id ? null : state.selectedPointId,
    })),
  addRouteLocal: (route) => set((state) => ({ routes: [...state.routes, route] })),
  removeRouteLocal: (id) => set((state) => ({ routes: state.routes.filter((r) => r.id !== id) })),
}))
export { STATUS_META } from '../lib/categoryHelpers'
