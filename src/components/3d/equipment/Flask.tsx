'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types'
import LiquidSurface from '../effects/LiquidSurface'

interface FlaskProps {
  position: [number, number, number]
  scale: [number, number, number]
  capacity: number
  contents: Chemical[]
  temperature: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Flask({
  position,
  scale,
  capacity,
  contents,
  temperature,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: FlaskProps) {
  const groupRef = useRef<THREE.Group>(null)
  const flaskRef = useRef<THREE.Mesh>(null)

  // Calculate liquid level
  const liquidLevel = useMemo(() => {
    if (!contents.length) return 0
    const totalVolume = contents.reduce((sum, chemical) => sum + (chemical.concentration || 0) * 100, 0)
    return Math.min(totalVolume / capacity, 0.8) * 1.0
  }, [contents, capacity])

  useFrame((state) => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.05 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      
      if (flaskRef.current) {
        flaskRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01
      }
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
      {/* Flask Body (Erlenmeyer shape) */}
      <mesh
        ref={flaskRef}
        castShadow
        receiveShadow
        position={[0, -0.2, 0]}
      >
        <coneGeometry args={[1.2, 1.5, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          roughness={0.05}
          metalness={0.02}
          transmission={0.95}
          thickness={0.1}
          ior={1.52}
        />
      </mesh>

      {/* Flask Neck */}
      <mesh
        position={[0, 0.6, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          roughness={0.05}
          metalness={0.02}
          transmission={0.95}
          thickness={0.1}
          ior={1.52}
        />
      </mesh>

      {/* Flask Opening */}
      <mesh
        position={[0, 1.0, 0]}
        castShadow
      >
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Liquid Content */}
      {contents.length > 0 && liquidLevel > 0 && (
        <group position={[0, -0.2, 0]}>
          <LiquidSurface
            position={[0, -0.75 + liquidLevel / 2, 0]}
            radius={0.8 * (liquidLevel / 1.0 + 0.3)}
            height={liquidLevel}
            color={contents[0].color}
            temperature={temperature}
            isReacting={temperature > 50}
          />
        </group>
      )}

      {/* Volume Graduations */}
      {[0.3, 0.6, 0.9].map((height, index) => (
        <mesh
          key={index}
          position={[0.8 - height * 0.3, -0.5 + height, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.005, 0.005, 0.1]} />
          <meshStandardMaterial
            color="#4a5568"
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Temperature Indicator */}
      {temperature > 30 && (
        <mesh
          position={[0, 1.2, 0]}
          scale={[0.05, 0.05, 0.05]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={temperature > 80 ? "#ff4444" : temperature > 50 ? "#ff8844" : "#ffaa44"}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Hover Glow */}
      {isHovered && (
        <>
          <mesh
            position={[0, -0.2, 0]}
            scale={[1.1, 1.1, 1.1]}
          >
            <coneGeometry args={[1.2, 1.5, 32]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.1}
            />
          </mesh>
          <mesh
            position={[0, 0.6, 0]}
            scale={[1.1, 1.1, 1.1]}
          >
            <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}
    </group>
  )
}