'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BunsenBurnerProps {
  position: [number, number, number]
  scale: [number, number, number]
  isLit: boolean
  temperature: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
  onIgnite?: () => void
  onExtinguish?: () => void
}

export default function BunsenBurner({
  position,
  scale,
  isLit = false,
  temperature,
  isHovered = false,
  onPointerOver,
  onPointerOut,
  onIgnite,
  onExtinguish
}: BunsenBurnerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const [isIgniting, setIsIgniting] = useState(false)
  const [flameIntensity, setFlameIntensity] = useState(isLit ? 1 : 0)

  const handleClick = () => {
    if (isLit) {
      onExtinguish?.()
      setFlameIntensity(0)
    } else {
      setIsIgniting(true)
      onIgnite?.()
      setTimeout(() => {
        setIsIgniting(false)
        setFlameIntensity(1)
      }, 500)
    }
  }

  useFrame((state) => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.05 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }

    // Animate flame intensity
    if (isLit || isIgniting) {
      const targetIntensity = isLit ? 1 : (isIgniting ? Math.random() * 0.8 : 0)
      setFlameIntensity(prev => THREE.MathUtils.lerp(prev, targetIntensity, 0.1))
    }

    // Animate flame
    if (flameRef.current && (isLit || isIgniting)) {
      flameRef.current.scale.x = flameIntensity * (1 + Math.sin(state.clock.elapsedTime * 8) * 0.1)
      flameRef.current.scale.z = flameIntensity * (1 + Math.cos(state.clock.elapsedTime * 10) * 0.1)
      flameRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 12) * 0.05 * flameIntensity
      
      // Flicker effect for ignition
      if (isIgniting) {
        flameRef.current.visible = Math.random() > 0.3
      } else {
        flameRef.current.visible = true
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
      onClick={handleClick}
    >
      {/* Base */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
        <meshStandardMaterial
          color="#2d3748"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Support Column */}
      <mesh
        position={[0, 0.5, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
        <meshStandardMaterial
          color="#4a5568"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Gas Valve */}
      <mesh
        position={[0, 0.3, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial
          color="#718096"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Valve Handle */}
      <mesh
        position={[0.15, 0.3, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
        <meshStandardMaterial
          color="#2d3748"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Burner Top */}
      <mesh
        position={[0, 0.9, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.15, 0.12, 0.1, 16]} />
        <meshStandardMaterial
          color="#4a5568"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Air Holes */}
      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={index}
          position={[
            Math.cos((index * Math.PI) / 2) * 0.14,
            0.9,
            Math.sin((index * Math.PI) / 2) * 0.14
          ]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
          <meshStandardMaterial
            color="#1a202c"
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Flame */}
      {(isLit || isIgniting) && (
        <mesh
          ref={flameRef}
          position={[0, 1.2, 0]}
          scale={[0.3 * flameIntensity, 0.6 * flameIntensity, 0.3 * flameIntensity]}
        >
          <coneGeometry args={[1, 2, 8]} />
          <meshStandardMaterial
            color={isIgniting ? "#ff6600" : "#4299e1"}
            transparent
            opacity={0.8 * flameIntensity}
            emissive={isIgniting ? "#ff3300" : "#1e40af"}
            emissiveIntensity={0.5 * flameIntensity}
          />
        </mesh>
      )}

      {/* Inner Flame */}
      {(isLit || isIgniting) && flameIntensity > 0.5 && (
        <mesh
          position={[0, 1.1, 0]}
          scale={[0.15 * flameIntensity, 0.3 * flameIntensity, 0.15 * flameIntensity]}
        >
          <coneGeometry args={[1, 2, 8]} />
          <meshStandardMaterial
            color={isIgniting ? "#ffaa00" : "#60a5fa"}
            transparent
            opacity={0.6 * flameIntensity}
            emissive={isIgniting ? "#ff6600" : "#3b82f6"}
            emissiveIntensity={0.8 * flameIntensity}
          />
        </mesh>
      )}

      {/* Heat Shimmer Effect */}
      {isLit && (
        <mesh
          position={[0, 1.5, 0]}
          scale={[0.5, 1, 0.5]}
        >
          <cylinderGeometry args={[1, 0.5, 2, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Temperature Display */}
      {temperature > 25 && (
        <mesh
          position={[0, 1.8, 0]}
          scale={[0.02, 0.02, 0.02]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color={temperature > 200 ? "#ff0000" : temperature > 100 ? "#ff4400" : "#ff8800"}
            emissive={temperature > 200 ? "#aa0000" : "#000000"}
            emissiveIntensity={temperature > 200 ? 0.5 : 0}
          />
        </mesh>
      )}

      {/* Gas Line */}
      <mesh
        position={[-0.5, 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial
          color="#718096"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Hover Glow */}
      {isHovered && (
        <mesh
          position={[0, 0.5, 0]}
          scale={[1.2, 1.2, 1.2]}
        >
          <cylinderGeometry args={[0.8, 0.8, 1.8, 16]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  )
}