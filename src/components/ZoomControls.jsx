import { useAppStore } from '../store/useAppStore'

export default function ZoomControls() {
  const zoomScale = useAppStore((s) => s.zoomScale)
  const setZoomScale = useAppStore((s) => s.setZoomScale)
  const resetZoomPan = useAppStore((s) => s.resetZoomPan)

  return (
    <div className="zoom-controls">
      <button onClick={() => setZoomScale(zoomScale - 0.5)} disabled={zoomScale <= 1}>−</button>
      <span>{Math.round(zoomScale * 100)}%</span>
      <button onClick={() => setZoomScale(zoomScale + 0.5)} disabled={zoomScale >= 4}>+</button>
      {zoomScale !== 1 && <button onClick={resetZoomPan}>Reset</button>}
    </div>
  )
}
