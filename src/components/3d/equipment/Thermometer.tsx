'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ThermometerProps {
  position: [number, number, number]
  scale: [number, number, number]
  temperature: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Thermometer({
  position,
  scale,
  temperature,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: ThermometerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mercuryRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.1 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }

    // Animate mercury level
    if (mercuryRef.current) {
      const targetHeight = Math.max(0.1, (temperature - 20) / 100)
      mercuryRef.current.scale.y = THREE.MathUtils.lerp(mercuryRef.current.scale.y, targetHeight, 0.05)
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
      {/* Glass Tube */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 12]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.05}
          transmission={0.9}
          ior={1.52}
        />
      </mesh>

      {/* Mercury/Alcohol */}
      <mesh
        ref={mercuryRef}
        position={[0, -0.7, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
        <meshStandardMaterial
          color={temperature > 80 ? "#ff4444" : temperature > 40 ? "#ff8844" : "#c53030"}
          emissive={temperature > 80 ? "#aa0000" : "#000000"}
          emissiveIntensity={temperature > 80 ? 0.2 : 0}
        />
      </mesh>

      {/* Bulb */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.05}
          transmission={0.9}
          ior={1.52}
        />
      </mesh>

      {/* Mercury in Bulb */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial
          color={temperature > 80 ? "#ff4444" : temperature > 40 ? "#ff8844" : "#c53030"}
          emissive={temperature > 80 ? "#aa0000" : "#000000"}
          emissiveIntensity={temperature > 80 ? 0.3 : 0}
        />
      </mesh>

      {/* Scale Markings */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={i}
          position={[0.025, -0.4 + i * 0.08, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.001, 0.001, 0.01]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}

      {/* Support Clip */}
      <mesh position={[0.05, 0.3, 0]} castShadow>
        <torusGeometry args={[0.04, 0.005, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#4a5568" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Hover Effect */}
      {isHovered && (
        <mesh scale={[1.5, 1.1, 1.5]}>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 12]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  )
}