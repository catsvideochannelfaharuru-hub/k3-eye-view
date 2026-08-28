import { create } from 'zustand'
import { STANDARD_CATEGORIES, MARKER_TYPE_META } from '../lib/categoryHelpers'

export const ALL_CATEGORY_KEYS = [
  ...STANDARD_CATEGORIES.map((c) => c.key),
  ...Object.keys(MARKER_TYPE_META),
  'hazard_zone', // toggle tampil/sembunyi layer zona bahaya
]

export const useAppStore = create((set, get) => ({
  viewMode: '2d', // '2d' | '3d'
  building: null,
  floors: [],
  activeFloorLevel: 1,

  assets: [], // semua baris assets_k3
  points: [], // k3_points mentah: {id, floor_id, asset_id, marker_type, label, pos_x, pos_y, direction_deg}
  routes: [], // evacuation_routes: {id, floor_id, label, points:[{x,y}]}
  zones: [], // hazard_zones: {id, floor_id, label, zone_type, points:[{x,y}]}

  activeCategories: ALL_CATEGORY_KEYS,
  selectedPointId: null,
  selectedRouteId: null,
  selectedZoneId: null,
  loading: true,
  error: null,

  // --- mode "tambah" ---
  addMappingOpen: true, // accordion "Tambah Mapping" di sidebar — terbuka/tertutup
  placementMode: null, // null | { kind: 'asset', asset } | { kind: 'marker', markerType }
  drawingRoute: false,
  routeDraft: [],
  drawingZone: null, // null | 'risk' | 'danger'
  zoneDraft: [],

  zoomScale: 1,
  panX: 0,
  panY: 0,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFloorLevel: (level) =>
    set({
      activeFloorLevel: level,
      selectedPointId: null,
      selectedRouteId: null,
      selectedZoneId: null,
      zoomScale: 1,
      panX: 0,
      panY: 0,
    }),
  toggleCategory: (cat) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(cat)
        ? state.activeCategories.filter((c) => c !== cat)
        : [...state.activeCategories, cat],
    })),
  setAllCategories: (keys) => set({ activeCategories: keys }),
  selectPoint: (id) => set({ selectedPointId: id, selectedRouteId: null, selectedZoneId: null }),
  selectRoute: (id) => set({ selectedRouteId: id, selectedPointId: null, selectedZoneId: null }),
  selectZone: (id) => set({ selectedZoneId: id, selectedPointId: null, selectedRouteId: null }),
  clearSelection: () => set({ selectedPointId: null, selectedRouteId: null, selectedZoneId: null }),
  setZoomScale: (zoomScale) => set({ zoomScale: Math.min(Math.max(zoomScale, 1), 4) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setZoomAndPan: (zoomScale, panX, panY) =>
    set({ zoomScale: Math.min(Math.max(zoomScale, 1), 4), panX, panY }),
  resetZoomPan: () => set({ zoomScale: 1, panX: 0, panY: 0 }),
  setAddMappingOpen: (addMappingOpen) => set({ addMappingOpen }),

  setData: ({ building, floors, assets, points, routes, zones }) => {
    set({ building, floors, assets, points, routes, zones: zones || [], loading: false })
  },
  setError: (error) => set({ error, loading: false }),

  activeFloor: () => {
    const state = get()
    return state.floors.find((f) => f.level === state.activeFloorLevel) || null
  },

  // --- actions mode tambah/placement ---
  startPlaceAsset: (asset) =>
    set({ placementMode: { kind: 'asset', asset }, drawingRoute: false, drawingZone: null }),
  startPlaceMarker: (markerType) =>
    set({ placementMode: { kind: 'marker', markerType }, drawingRoute: false, drawingZone: null }),
  cancelPlacement: () => set({ placementMode: null }),

  startDrawRoute: () => set({ drawingRoute: true, routeDraft: [], placementMode: null, drawingZone: null }),
  addRouteVertex: (pt) => set((state) => ({ routeDraft: [...state.routeDraft, pt] })),
  undoRouteVertex: () => set((state) => ({ routeDraft: state.routeDraft.slice(0, -1) })),
  cancelDrawRoute: () => set({ drawingRoute: false, routeDraft: [] }),

  startDrawZone: (zoneType) =>
    set({ drawingZone: zoneType, zoneDraft: [], placementMode: null, drawingRoute: false }),
  addZoneVertex: (pt) => set((state) => ({ zoneDraft: [...state.zoneDraft, pt] })),
  undoZoneVertex: () => set((state) => ({ zoneDraft: state.zoneDraft.slice(0, -1) })),
  cancelDrawZone: () => set({ drawingZone: null, zoneDraft: [] }),

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
  removeRouteLocal: (id) =>
    set((state) => ({
      routes: state.routes.filter((r) => r.id !== id),
      selectedRouteId: state.selectedRouteId === id ? null : state.selectedRouteId,
    })),
  addZoneLocal: (zone) => set((state) => ({ zones: [...state.zones, zone] })),
  removeZoneLocal: (id) =>
    set((state) => ({
      zones: state.zones.filter((z) => z.id !== id),
      selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId,
    })),
}))

export { STATUS_META } from '../lib/categoryHelpers'
