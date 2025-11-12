import { useRef } from 'react'
import * as THREE from 'three'
import { Chemical } from '@/types/experiment'

interface BeakerProps {
  position: [number, number, number]
  scale?: [number, number, number]
  capacity?: number
  contents?: Chemical[]
  temperature?: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Beaker({
  position,
  scale = [1, 1, 1],
  contents = [],
  isHovered = false,
  onPointerOver,
  onPointerOut,
}: BeakerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const fillLevel = contents.length > 0 ? 0.3 + (contents.length * 0.1) : 0
  const liquidColor = contents.length > 0 ? contents[contents.length - 1].color : '#00ffff'

  return (
    <group position={position} scale={scale}>
      {/* Beaker body */}
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Liquid inside */}
      {fillLevel > 0 && (
        <mesh position={[0, -0.5 + fillLevel / 2, 0]}>
          <cylinderGeometry args={[0.48, 0.48, fillLevel, 32]} />
          <meshPhysicalMaterial
            color={liquidColor}
            transparent
            opacity={0.6}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Rim */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.02, 16, 32]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      {/* Glow when hovered */}
      {isHovered && (
        <pointLight position={[0, 0, 0]} intensity={0.5} distance={2} color="#00ffff" />
      )}
    </group>
  )
}
