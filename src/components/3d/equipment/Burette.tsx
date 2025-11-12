'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types'

interface BuretteProps {
  position: [number, number, number]
  scale: [number, number, number]
  capacity: number
  contents: Chemical[]
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Burette({
  position,
  scale,
  capacity,
  contents,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: BuretteProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.05 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Main Tube */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0.05}
          transmission={0.95}
          ior={1.52}
        />
      </mesh>

      {/* Stopcock */}
      <mesh position={[0, -1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#718096" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Tip */}
      <mesh position={[0, -1.5, 0]} castShadow>
        <coneGeometry args={[0.02, 0.3, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          transmission={0.95}
          ior={1.52}
        />
      </mesh>

      {/* Support Clamp */}
      <mesh position={[0.15, 0.5, 0]} castShadow>
        <torusGeometry args={[0.12, 0.02, 8, 16]} />
        <meshStandardMaterial color="#4a5568" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Graduation Marks */}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh
          key={i}
          position={[0.07, 1 - i * 0.08, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.002, 0.002, i % 5 === 0 ? 0.04 : 0.02]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      ))}

      {/* Hover Effect */}
      {isHovered && (
        <mesh scale={[1.2, 1.1, 1.2]}>
          <cylinderGeometry args={[0.08, 0.08, 2.5, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  )
}