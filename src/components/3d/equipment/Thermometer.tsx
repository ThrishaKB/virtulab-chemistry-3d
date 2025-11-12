interface ThermometerProps {
  position: [number, number, number]
  scale?: [number, number, number]
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Thermometer({ position, scale = [1, 1, 1], temperature = 25 }: ThermometerProps) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0, -0.5, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}
