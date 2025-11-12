import * as THREE from 'three'
import { Chemical } from '@/types/experiment'

interface FlaskProps {
  position: [number, number, number]
  scale?: [number, number, number]
  capacity?: number
  contents?: Chemical[]
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Flask({ position, scale = [1, 1, 1], contents = [] }: FlaskProps) {
  const fillLevel = contents.length > 0 ? 0.3 : 0
  const liquidColor = contents.length > 0 ? contents[0].color : '#00ffff'

  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>
      {fillLevel > 0 && (
        <mesh position={[0, -0.3, 0]}>
          <coneGeometry args={[0.4, fillLevel, 32]} />
          <meshPhysicalMaterial color={liquidColor} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
