'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types'

interface GraduatedCylinderProps {
  position: [number, number, number]
  scale: [number, number, number]
  capacity: number
  contents: Chemical[]
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function GraduatedCylinder({
  position,
  scale,
  capacity,
  contents,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: GraduatedCylinderProps) {
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
      {/* Main Cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0.05}
          transmission={0.95}
          ior={1.52}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -1, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#4a5568" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Spout */}
      <mesh position={[0.2, 0.8, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.2, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          transmission={0.95}
          ior={1.52}
        />
      </mesh>

      {/* Graduation Marks */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={i}
          position={[0.19, -0.8 + i * 0.16, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.003, 0.003, i % 5 === 0 ? 0.06 : 0.03]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      ))}

      {/* Hover Effect */}
      {isHovered && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  )
}