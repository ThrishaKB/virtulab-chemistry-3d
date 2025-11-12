interface StirringRodProps {
  position: [number, number, number]
  scale?: [number, number, number]
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function StirringRod({ position, scale = [1, 1, 1] }: StirringRodProps) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
    </group>
  )
}
