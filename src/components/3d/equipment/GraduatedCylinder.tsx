import { Chemical } from '@/types/experiment'

interface GraduatedCylinderProps {
  position: [number, number, number]
  scale?: [number, number, number]
  capacity?: number
  contents?: Chemical[]
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function GraduatedCylinder({ position, scale = [1, 1, 1], contents = [] }: GraduatedCylinderProps) {
  const fillLevel = contents.length > 0 ? 0.4 : 0
  const liquidColor = contents.length > 0 ? contents[0].color : '#00ffff'

  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {fillLevel > 0 && (
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.28, 0.28, fillLevel, 16]} />
          <meshPhysicalMaterial color={liquidColor} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
