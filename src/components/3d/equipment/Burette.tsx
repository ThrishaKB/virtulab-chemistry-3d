import { Chemical } from '@/types/experiment'

interface BuretteProps {
  position: [number, number, number]
  scale?: [number, number, number]
  capacity?: number
  contents?: Chemical[]
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Burette({ position, scale = [1, 1, 1] }: BuretteProps) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
