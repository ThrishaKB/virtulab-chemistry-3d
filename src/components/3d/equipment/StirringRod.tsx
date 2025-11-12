'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StirringRodProps {
  position: [number, number, number]
  scale: [number, number, number]
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function StirringRod({
  position,
  scale,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: StirringRodProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.1 : 1
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
      {/* Main Rod */}
      <mesh castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Handle End */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#4a5568"
          roughness={0.4}
        />
      </mesh>

      {/* Hover Effect */}
      {isHovered && (
        <mesh scale={[1.5, 1.1, 1.5]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  )
}