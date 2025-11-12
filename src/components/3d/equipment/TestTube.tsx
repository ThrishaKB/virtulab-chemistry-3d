'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types'
import LiquidSurface from '../effects/LiquidSurface'

interface TestTubeProps {
  position: [number, number, number]
  scale: [number, number, number]
  capacity: number
  contents: Chemical[]
  temperature: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function TestTube({
  position,
  scale,
  capacity,
  contents,
  temperature,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: TestTubeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tubeRef = useRef<THREE.Mesh>(null)

  const liquidLevel = useMemo(() => {
    if (!contents.length) return 0
    const totalVolume = contents.reduce((sum, chemical) => sum + (chemical.concentration || 0) * 10, 0)
    return Math.min(totalVolume / capacity, 0.8) * 1.2
  }, [contents, capacity])

  useFrame((state) => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.1 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      
      if (tubeRef.current) {
        tubeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
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
      {/* Test Tube Body */}
      <mesh
        ref={tubeRef}
        castShadow
        receiveShadow
        position={[0, 0.2, 0]}
      >
        <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0.05}
          metalness={0.02}
          transmission={0.95}
          thickness={0.05}
          ior={1.52}
        />
      </mesh>

      {/* Rounded Bottom */}
      <mesh
        position={[0, -0.6, 0]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0.05}
          metalness={0.02}
          transmission={0.95}
          thickness={0.05}
          ior={1.52}
        />
      </mesh>

      {/* Test Tube Rim */}
      <mesh
        position={[0, 1.0, 0]}
        castShadow
      >
        <torusGeometry args={[0.15, 0.01, 8, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Liquid Content */}
      {contents.length > 0 && liquidLevel > 0 && (
        <LiquidSurface
          position={[0, -0.6 + liquidLevel / 2, 0]}
          radius={0.13}
          height={liquidLevel}
          color={contents[0].color}
          temperature={temperature}
          isReacting={temperature > 50}
        />
      )}

      {/* Volume Markings */}
      {[0.2, 0.4, 0.6, 0.8].map((height, index) => (
        <mesh
          key={index}
          position={[0.14, -0.4 + height, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.002, 0.002, 0.03]} />
          <meshStandardMaterial
            color="#4a5568"
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Cork/Stopper (when needed) */}
      {contents.length > 0 && (
        <mesh
          position={[0, 1.1, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.12, 0.15, 0.2, 12]} />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.8}
            normalScale={new THREE.Vector2(0.5, 0.5)}
          />
        </mesh>
      )}

      {/* Test Tube Rack Slot */}
      <mesh
        position={[0, -1.2, 0]}
        receiveShadow
      >
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial
          color="#4a5568"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Temperature Indicator */}
      {temperature > 30 && (
        <mesh
          position={[0.2, 0.8, 0]}
          scale={[0.03, 0.03, 0.03]}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color={temperature > 80 ? "#ff4444" : temperature > 50 ? "#ff8844" : "#ffaa44"}
            emissive={temperature > 80 ? "#ff2222" : "#000000"}
            emissiveIntensity={temperature > 80 ? 0.4 : 0}
          />
        </mesh>
      )}

      {/* Hover Glow */}
      {isHovered && (
        <>
          <mesh
            position={[0, 0.2, 0]}
            scale={[1.2, 1.2, 1.2]}
          >
            <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.15}
            />
          </mesh>
          <mesh
            position={[0, -0.6, 0]}
            scale={[1.2, 1.2, 1.2]}
          >
            <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.15}
            />
          </mesh>
        </>
      )}
    </group>
  )
}