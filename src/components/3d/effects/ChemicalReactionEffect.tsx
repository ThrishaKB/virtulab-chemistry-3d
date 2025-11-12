'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ChemicalReactionEffectProps {
  position: [number, number, number]
  reactionType: 'color-change' | 'gas-evolution' | 'precipitation' | 'heat-release' | 'bubbling'
  intensity: number
  color: string
  isActive: boolean
  duration?: number
}

export default function ChemicalReactionEffect({
  position,
  reactionType,
  intensity,
  color,
  isActive,
  duration = 5000
}: ChemicalReactionEffectProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [startTime, setStartTime] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isActive) {
      setStartTime(Date.now())
    }
  }, [isActive])

  useFrame((state) => {
    if (!isActive) return

    const elapsed = Date.now() - startTime
    const newProgress = Math.min(elapsed / duration, 1)
    setProgress(newProgress)

    if (groupRef.current) {
      // Apply different animations based on reaction type
      switch (reactionType) {
        case 'bubbling':
          animateBubbling(state, newProgress)
          break
        case 'gas-evolution':
          animateGasEvolution(state, newProgress)
          break
        case 'color-change':
          animateColorChange(state, newProgress)
          break
        case 'precipitation':
          animatePrecipitation(state, newProgress)
          break
        case 'heat-release':
          animateHeatRelease(state, newProgress)
          break
      }
    }
  })

  const animateBubbling = (state: any, progress: number) => {
    // Create bubbling effect with multiple spheres
    groupRef.current?.children.forEach((child, index) => {
      if (child.userData.bubble) {
        const bubbleSpeed = 0.02 * intensity
        child.position.y += bubbleSpeed
        child.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.1)
        
        // Reset bubble when it reaches top
        if (child.position.y > position[1] + 2) {
          child.position.y = position[1]
          child.position.x = position[0] + (Math.random() - 0.5) * 0.5
          child.position.z = position[2] + (Math.random() - 0.5) * 0.5
        }
      }
    })
  }

  const animateGasEvolution = (state: any, progress: number) => {
    // Create rising gas effect
    groupRef.current?.children.forEach((child, index) => {
      if (child.userData.gas) {
        child.position.y += 0.03 * intensity
        child.scale.x = 1 + progress * 0.5
        child.scale.z = 1 + progress * 0.5
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          if ('opacity' in material) {
            material.opacity = Math.max(0, 0.6 - progress * 0.6);
          }
        }
        
        if (child.position.y > position[1] + 3) {
          child.position.y = position[1]
        }
      }
    })
  }

  const animateColorChange = (state: any, progress: number) => {
    // Color change animation removed to eliminate glow effect
  }

  const animatePrecipitation = (state: any, progress: number) => {
    // Animate falling particles
    groupRef.current?.children.forEach((child) => {
      if (child.userData.precipitate) {
        child.position.y -= 0.012 * intensity
        child.rotation.x += 0.015
        child.rotation.z += 0.008
        
        // When particles reach bottom, they disappear (become part of the layer)
        if (child.position.y < position[1] - 0.45) {
          child.position.y = position[1] + Math.random() * 0.25
          child.position.x = position[0] + (Math.random() - 0.5) * 0.5
          child.position.z = position[2] + (Math.random() - 0.5) * 0.5
        }
      }
    })
  }

  const animateHeatRelease = (state: any, progress: number) => {
    // Create heat shimmer effect
    groupRef.current?.children.forEach((child) => {
      if (child.userData.heat) {
        child.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.005
        child.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.05 * intensity)
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          if ('opacity' in material) {
            material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
          }
        }
      }
    })
  }

  const renderBubblingEffect = () => {
    return (
      <>
        {[...Array(Math.floor(intensity * 8))].map((_, i) => (
          <mesh
            key={i}
            position={[
              position[0] + (Math.random() - 0.5) * 0.4,
              position[1] + Math.random() * 0.3,
              position[2] + (Math.random() - 0.5) * 0.4
            ]}
            scale={[0.05, 0.05, 0.05]}
            userData={{ bubble: true }}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </>
    )
  }

  const renderGasEvolutionEffect = () => {
    return (
      <>
        {[...Array(Math.floor(intensity * 5))].map((_, i) => (
          <mesh
            key={i}
            position={[
              position[0] + (Math.random() - 0.5) * 0.3,
              position[1] + i * 0.2,
              position[2] + (Math.random() - 0.5) * 0.3
            ]}
            scale={[0.1, 0.2, 0.1]}
            userData={{ gas: true }}
          >
            <cylinderGeometry args={[1, 0.5, 1, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </>
    )
  }

  const renderColorChangeEffect = () => {
    // Return null to remove the blue/white dome effect
    return null
  }

  const renderPrecipitationEffect = () => {
    // Calculate layer properties based on progress
    const layerHeight = 0.04 + (progress * 0.15) // Grows from 0.04 to 0.19
    const layerY = position[1] - 0.48 + (layerHeight / 2) // Position at bottom
    
    return (
      <>
        {/* Solid white precipitate layer at the very bottom */}
        <mesh
          position={[position[0], layerY, position[2]]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.6, 0.6, layerHeight, 32]} />
          <meshStandardMaterial
            color="#F8F8F8" // Off-white color for silver chloride
            metalness={0.0}
            roughness={0.8} // Higher roughness for cloudy appearance
            transparent={false}
            opacity={1.0}
          />
        </mesh>
        
        {/* Fine particles falling during precipitation (first 80% of reaction) */}
        {progress < 0.8 && [...Array(Math.floor(intensity * 25))].map((_, i) => {
          return (
            <mesh
              key={i}
              position={[
                position[0] + (Math.random() - 0.5) * 0.6,
                position[1] + 0.3 - ((progress + i * 0.02) % 1) * 0.8,
                position[2] + (Math.random() - 0.5) * 0.6
              ]}
              scale={[0.015, 0.015, 0.015]}
              userData={{ precipitate: true }}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial
                color="#F8F8F8" // Off-white color for silver chloride
                metalness={0.0}
                roughness={0.9}
                transparent={true}
                opacity={0.85}
              />
            </mesh>
          )
        })}
      </>
    )
  }

  const renderHeatReleaseEffect = () => {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <mesh
            key={i}
            position={[
              position[0],
              position[1] + i * 0.3,
              position[2]
            ]}
            scale={[0.3 + i * 0.1, 0.5, 0.3 + i * 0.1]}
            userData={{ heat: true }}
          >
            <cylinderGeometry args={[1, 0.5, 1, 8]} />
            <meshBasicMaterial
              color="#ffaa44"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </>
    )
  }

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      {reactionType === 'bubbling' && renderBubblingEffect()}
      {reactionType === 'gas-evolution' && renderGasEvolutionEffect()}
      {reactionType === 'color-change' && renderColorChangeEffect()}
      {reactionType === 'precipitation' && renderPrecipitationEffect()}
      {reactionType === 'heat-release' && renderHeatReleaseEffect()}
    </group>
  )
}