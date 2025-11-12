import { Chemical } from '@/types/experiment'

interface TestTubeProps {
  position: [number, number, number]
  scale?: [number, number, number]
  capacity?: number
  contents?: Chemical[]
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function TestTube({ position, scale = [1, 1, 1], contents = [] }: TestTubeProps) {
  const fillLevel = contents.length > 0 ? 0.3 : 0
  const liquidColor = contents.length > 0 ? contents[0].color : '#00ffff'

  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {fillLevel > 0 && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.14, 0.14, fillLevel, 16]} />
          <meshPhysicalMaterial color={liquidColor} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
