'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Plane } from '@react-three/drei'
import * as THREE from 'three'

export default function LabEnvironment() {
  const labTableRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    // Subtle animation for the lab environment
    if (labTableRef.current) {
      labTableRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.01
    }
  })

  return (
    <group>
      {/* Lab Table */}
      <mesh
        ref={labTableRef}
        position={[0, -1.5, 0]}
        receiveShadow
      >
        <boxGeometry args={[12, 0.2, 8]} />
        <meshStandardMaterial 
          color="#4a5568"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Table Legs */}
      {[
        [-5.5, -2.5, -3.5],
        [5.5, -2.5, -3.5],
        [-5.5, -2.5, 3.5],
        [5.5, -2.5, 3.5]
      ].map((position, index) => (
        <mesh
          key={index}
          position={position as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.1, 0.1, 2]} />
          <meshStandardMaterial 
            color="#2d3748"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Floor */}
      <Plane
        args={[50, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#1a202c"
          roughness={0.8}
        />
      </Plane>

      {/* Back Wall */}
      <Plane
        args={[20, 10]}
        position={[0, 2, -10]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.9}
        />
      </Plane>

      {/* Side Walls */}
      <Plane
        args={[20, 10]}
        position={[-10, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.9}
        />
      </Plane>

      <Plane
        args={[20, 10]}
        position={[10, 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.9}
        />
      </Plane>

      {/* Lab Equipment Shelf */}
      <mesh
        position={[0, 1, -9.5]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[8, 0.1, 1]} />
        <meshStandardMaterial 
          color="#4a5568"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Shelf Supports */}
      {[-3.5, 3.5].map((x, index) => (
        <mesh
          key={index}
          position={[x, 0.5, -9.5]}
          castShadow
        >
          <boxGeometry args={[0.1, 1, 1]} />
          <meshStandardMaterial 
            color="#2d3748"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Overhead Lighting Fixture */}
      <mesh
        position={[0, 6, 0]}
        castShadow
      >
        <cylinderGeometry args={[1.5, 1.5, 0.2]} />
        <meshStandardMaterial 
          color="#e2e8f0"
          roughness={0.1}
          metalness={0.8}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Ventilation Hood */}
      <group position={[-4, 1.5, -8]}>
        <mesh castShadow>
          <boxGeometry args={[3, 1.5, 1.5]} />
          <meshStandardMaterial 
            color="#718096"
            roughness={0.2}
            metalness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Hood Opening */}
        <mesh position={[0, -0.3, 0.8]}>
          <boxGeometry args={[2.8, 0.8, 0.1]} />
          <meshStandardMaterial 
            color="#1a202c"
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Safety Shower (Background Detail) */}
      <group position={[8, 0, -8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3]} />
          <meshStandardMaterial 
            color="#e2e8f0"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color="#e2e8f0"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Window (Background) */}
      <mesh
        position={[8, 3, -9.9]}
        receiveShadow
      >
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial 
          color="#87ceeb"
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Window Frame */}
      <mesh
        position={[8, 3, -9.85]}
        castShadow
      >
        <ringGeometry args={[0.95, 1.05]} />
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}