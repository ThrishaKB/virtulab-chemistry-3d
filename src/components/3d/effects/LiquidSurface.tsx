'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LiquidSurfaceProps {
  position: [number, number, number]
  radius: number
  height: number
  color: string
  temperature: number
  isReacting?: boolean
}

export default function LiquidSurface({
  position,
  radius,
  height,
  color,
  temperature,
  isReacting = false
}: LiquidSurfaceProps) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const surfaceRef = useRef<THREE.Mesh>(null)
  const bubblesRef = useRef<THREE.Group>(null)

  // Create liquid material based on temperature - NO REACTION GLOW
  const liquidMaterial = useMemo(() => {
    const baseColor = new THREE.Color(color)
    
    if (temperature > 80) {
      baseColor.lerp(new THREE.Color('#ff4444'), 0.2)
    }

    return new THREE.MeshPhysicalMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.3,
      thickness: 0.2,
      ior: 1.33,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0
    })
  }, [color, temperature])

  // Create surface ripple effect
  const surfaceGeometry = useMemo(() => {
    const geometry = new THREE.CircleGeometry(radius, 32)
    const positions = geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      const distance = Math.sqrt(x * x + z * z)
      positions[i + 1] = Math.sin(distance * 5) * 0.02
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    return geometry
  }, [radius])

  useFrame((state) => {
    if (surfaceRef.current) {
      const time = state.clock.elapsedTime
      surfaceRef.current.rotation.z = Math.sin(time * 0.5) * 0.02
      
      if (isReacting || temperature > 70) {
        surfaceRef.current.position.y = position[1] + height/2 + Math.sin(time * 8) * 0.01
      }
    }

    if (bubblesRef.current && (temperature > 60 || isReacting)) {
      bubblesRef.current.children.forEach((bubble, index) => {
        const time = state.clock.elapsedTime + index
        bubble.position.y += 0.01
        bubble.scale.x = 1 + Math.sin(time * 3) * 0.1
        bubble.scale.z = 1 + Math.cos(time * 3) * 0.1
        
        if (bubble.position.y > height/2 + 0.2) {
          bubble.position.y = -height/2
          bubble.position.x = (Math.random() - 0.5) * radius * 1.5
          bubble.position.z = (Math.random() - 0.5) * radius * 1.5
        }
      })
    }
  })

  return (
    <group position={position}>
      {/* Main Liquid Body */}
      <mesh
        ref={liquidRef}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <primitive object={liquidMaterial} />
      </mesh>

      {/* Liquid Surface */}
      <mesh
        ref={surfaceRef}
        position={[0, height/2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <primitive object={surfaceGeometry} />
        <primitive object={liquidMaterial.clone()} />
      </mesh>

      {/* Bubbles for reactions or heating */}
      {(temperature > 60 || isReacting) && (
        <group ref={bubblesRef}>
          {Array.from({ length: isReacting ? 8 : 4 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * radius * 1.5,
                -height/2 + Math.random() * height,
                (Math.random() - 0.5) * radius * 1.5
              ]}
              scale={[0.1, 0.1, 0.1]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.4}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Steam effect for very hot liquids */}
      {temperature > 80 && (
        <group position={[0, height/2 + 0.1, 0]}>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * radius,
                Math.random() * 0.5,
                (Math.random() - 0.5) * radius
              ]}
              scale={[0.05, 0.2, 0.05]}
            >
              <cylinderGeometry args={[1, 0.5, 1, 6]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.2}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Reaction glow effect - REMOVED */}
    </group>
  )
}