import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LiquidSurfaceProps {
  position: [number, number, number]
  radius: number
  height: number
  color: string
  temperature: number
  isReacting: boolean
}

export default function LiquidSurface({
  position,
  radius,
  height,
  color,
  temperature,
  isReacting,
}: LiquidSurfaceProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      
      // Gentle wave motion
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.01
      
      // Stronger bubbling when reacting
      if (isReacting) {
        meshRef.current.position.y += Math.sin(time * 5) * 0.02
      }
    }
  })

  const bubbleIntensity = isReacting ? 0.6 : 0.3

  return (
    <group position={position}>
      {/* Main liquid body */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.0}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
          transmission={0.5}
          ior={1.33}
        />
      </mesh>

      {/* Liquid surface */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, 0.02, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={bubbleIntensity}
          roughness={0.05}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Bubbles when reacting */}
      {isReacting && Array.from({ length: 5 }).map((_, index) => (
        <mesh
          key={index}
          position={[
            (Math.random() - 0.5) * radius * 1.5,
            height / 2 - 0.1 + Math.random() * 0.2,
            (Math.random() - 0.5) * radius * 1.5,
          ]}
        >
          <sphereGeometry args={[0.02 + Math.random() * 0.03, 8, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            roughness={0.1}
            transmission={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}
