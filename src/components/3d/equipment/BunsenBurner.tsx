interface BunsenBurnerProps {
  position: [number, number, number]
  scale?: [number, number, number]
  isLit?: boolean
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function BunsenBurner({ position, scale = [1, 1, 1], isLit = false }: BunsenBurnerProps) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {isLit && (
        <pointLight position={[0, 0.5, 0]} intensity={2} distance={3} color="#ff6600" />
      )}
    </group>
  )
}
