import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture, Html } from '@react-three/drei'
import { useAppStore, STATUS_META } from '../store/useAppStore'

const METERS_PER_UNIT_X = 40 // lebar denah (dunia 3D) dalam "meter arbitrer" — cukup untuk proporsi visual

function FloorPlane({ floor, isActive, onSelectFloor }) {
  const texture = useTexture(floor.image_url)
  const aspect = floor.image_height / floor.image_width
  const width = METERS_PER_UNIT_X
  const depth = width * aspect

  return (
    <group position={[0, floor.elevation_z, 0]}>
      {/* raycast={() => null}: lempengan lantai murni visual, tidak menghalangi
          klik ke marker di lantai lain — lihat catatan di bawah komponen ini */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={isActive ? 1 : 0.55}
          side={2}
        />
      </mesh>
      <Html position={[-width / 2 + 1, 0.05, -depth / 2 + 1]} distanceFactor={30}>
        <button
          className={`floor3d__label ${isActive ? 'floor3d__label--active' : ''}`}
          onClick={() => onSelectFloor(floor.level)}
        >
          {floor.name}
        </button>
      </Html>
    </group>
  )
}

function PointMarker({ point, floor, selected, onSelect }) {
  const aspect = floor.image_height / floor.image_width
  const width = METERS_PER_UNIT_X
  const depth = width * aspect
  const x = (point.pos_x - 0.5) * width
  const z = (point.pos_y - 0.5) * depth
  const status = STATUS_META[point.status]

  return (
    <group position={[x, floor.elevation_z + 0.4, z]}>
      {/* hit-area tak kasat mata, lebih besar dari bola visualnya —
          supaya gampang diklik tanpa mengubah tampilan */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(point.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh raycast={() => null}>
        <sphereGeometry args={[selected ? 0.5 : 0.35, 16, 16]} />
        <meshStandardMaterial
          color={status.color}
          emissive={status.color}
          emissiveIntensity={selected ? 0.9 : 0.4}
        />
      </mesh>
    </group>
  )
}

export default function Floor3DView() {
  const floors = useAppStore((s) => s.floors)
  const points = useAppStore((s) => s.points)
  const activeCategories = useAppStore((s) => s.activeCategories)
  const activeFloorLevel = useAppStore((s) => s.activeFloorLevel)
  const setActiveFloorLevel = useAppStore((s) => s.setActiveFloorLevel)
  const selectedPointId = useAppStore((s) => s.selectedPointId)
  const selectPoint = useAppStore((s) => s.selectPoint)

  const sortedFloors = floors.slice().sort((a, b) => a.level - b.level)
  const topZ = sortedFloors.length ? sortedFloors[sortedFloors.length - 1].elevation_z : 10

  return (
    <div className="floor3d">
      <Canvas camera={{ position: [45, topZ + 25, 45], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[30, 50, 20]} intensity={0.8} />
        <Suspense fallback={null}>
          {sortedFloors.map((floor) => (
            <group key={floor.id}>
              <FloorPlane
                floor={floor}
                isActive={floor.level === activeFloorLevel}
                onSelectFloor={setActiveFloorLevel}
              />
              {points
                .filter((p) => p.floor_id === floor.id && activeCategories.includes(p.category))
                .map((p) => (
                  <PointMarker
                    key={p.id}
                    point={p}
                    floor={floor}
                    selected={p.id === selectedPointId}
                    onSelect={selectPoint}
                  />
                ))}
            </group>
          ))}
        </Suspense>
        <OrbitControls target={[0, topZ / 2, 0]} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  )
}
