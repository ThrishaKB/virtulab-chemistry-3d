'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ReactionEffectProps {
  position: [number, number, number]
  reactionType: 'acid-base' | 'precipitation' | 'gas-evolution' | 'color-change' | 'heat-release' | 'boiling' | 'smoke' | 'crystallization'
  intensity: number
  isActive: boolean
  chemicals: string[]
  onComplete?: () => void
  effects?: {
    type: string
    color?: string
    particle?: string
    intensity: number
    duration: number
  }[]
}

export default function ReactionEffect({
  position,
  reactionType,
  intensity,
  isActive,
  chemicals,
  onComplete,
  effects
}: ReactionEffectProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const gasRef = useRef<THREE.Group>(null)
  const colorChangeRef = useRef<THREE.Mesh>(null)
  const boilingRef = useRef<THREE.Group>(null)
  const smokeRef = useRef<THREE.Group>(null)
  const startTime = useRef(0)

  // Create reaction-specific particles
  const particleData = useMemo(() => {
    // Use effects data if provided, otherwise fallback to reactionType
    const effectType = effects && effects.length > 0 ? effects[0].type : reactionType
    const particleCount = effectType === 'gas-evolution' || effectType === 'boiling' ? 250 : 
                         effectType === 'precipitation' ? 40 : // Reduced particles for realistic streaks
                         effectType === 'smoke' ? 100 : 50; // Fixed particle count
    
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position particles at reaction center
      positions[i3] = position[0] + (Math.random() - 0.5) * 0.3
      positions[i3 + 1] = position[1] + Math.random() * 0.2
      positions[i3 + 2] = position[2] + (Math.random() - 0.5) * 0.3

      // Reaction-specific velocities
      switch (effectType) {
        case 'gas-evolution':
          velocities[i3] = (Math.random() - 0.5) * 0.03
          velocities[i3 + 1] = Math.random() * 0.08 + 0.03 // Upward
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.03
          break
        case 'boiling':
          velocities[i3] = (Math.random() - 0.5) * 0.02
          velocities[i3 + 1] = Math.random() * 0.06 + 0.02 // Vigorous upward
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
          break
        case 'precipitation':
          velocities[i3] = (Math.random() - 0.5) * 0.01 // Less horizontal movement
          velocities[i3 + 1] = -Math.random() * 0.02 // Slower settling
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.01 // Less horizontal movement
          break
        case 'heat-release':
          velocities[i3] = (Math.random() - 0.5) * 0.04
          velocities[i3 + 1] = Math.random() * 0.05 + 0.01
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.04
          break
        case 'smoke':
          velocities[i3] = (Math.random() - 0.5) * 0.01
          velocities[i3 + 1] = Math.random() * 0.02 + 0.01 // Slow upward
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
          break
        default:
          velocities[i3] = (Math.random() - 0.5) * 0.02
          velocities[i3 + 1] = Math.random() * 0.03
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
      }

      // Reaction-specific colors
      switch (effectType) {
        case 'acid-base':
          // Pink to colorless transition for phenolphthalein
          colors[i3] = 1.0 // Red
          colors[i3 + 1] = 0.3 + Math.random() * 0.5 // Green
          colors[i3 + 2] = 0.6 + Math.random() * 0.4 // Blue
          break
        case 'precipitation':
          // Off-white color for silver chloride precipitate
          colors[i3] = 0.97 + Math.random() * 0.03 // Off-white
          colors[i3 + 1] = 0.97 + Math.random() * 0.03
          colors[i3 + 2] = 0.97 + Math.random() * 0.03
          break;
        case 'gas-evolution':
          // More realistic oxygen bubble colors (slightly blue-tinted)
          colors[i3] = 0.95 + Math.random() * 0.05 // Light gray with slight blue tint
          colors[i3 + 1] = 0.95 + Math.random() * 0.05
          colors[i3 + 2] = 0.98 + Math.random() * 0.02 // Slight blue tint for oxygen
          break
        case 'boiling':
          colors[i3] = 0.8 + Math.random() * 0.2 // Light blue/white
          colors[i3 + 1] = 0.8 + Math.random() * 0.2
          colors[i3 + 2] = 0.9 + Math.random() * 0.1
          break
        case 'heat-release':
          colors[i3] = 1.0 // Red-orange
          colors[i3 + 1] = 0.4 + Math.random() * 0.3
          colors[i3 + 2] = 0.1
          break
        case 'smoke':
          colors[i3] = 0.7 + Math.random() * 0.3 // Gray
          colors[i3 + 1] = 0.7 + Math.random() * 0.3
          colors[i3 + 2] = 0.7 + Math.random() * 0.3
          break
        case 'color-change':
          // Dynamic color change
          colors[i3] = Math.random()
          colors[i3 + 1] = Math.random()
          colors[i3 + 2] = Math.random()
          break
        default:
          colors[i3] = Math.random()
          colors[i3 + 1] = Math.random()
          colors[i3 + 2] = Math.random()
      }

      // Variable sizes for more realistic bubbles
      sizes[i] = effectType === 'precipitation' ? Math.random() * 0.06 + 0.02 : // Larger for precipitate streaks
                Math.random() * 0.1 + 0.015 // Optimized range for other particles
    }

    return { positions, velocities, colors, sizes, particleCount }
  }, [reactionType, position, effects])

  useFrame(({ clock }) => {
    if (!isActive) return

    const elapsed = clock.elapsedTime - startTime.current
    // Use duration from effects if provided, otherwise default to 5 seconds
    const duration = (effects && effects.length > 0) ? effects[0].duration / 1000 : 5
    const progress = Math.min(elapsed / duration, 1)

    // Use effects data if provided, otherwise fallback to reactionType
    const effectType = effects && effects.length > 0 ? effects[0].type : reactionType

    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry
      const positions = geometry.attributes.position.array as Float32Array
      const colors = geometry.attributes.color.array as Float32Array

      for (let i = 0; i < particleData.particleCount; i++) {
        const i3 = i * 3

        // Update positions
        positions[i3] += particleData.velocities[i3] * intensity
        positions[i3 + 1] += particleData.velocities[i3 + 1] * intensity
        positions[i3 + 2] += particleData.velocities[i3 + 2] * intensity

        // Apply reaction-specific physics
        switch (effectType) {
          case 'gas-evolution':
            // More realistic bubble physics for oxygen evolution
            particleData.velocities[i3] *= 0.99; // Horizontal damping for realistic movement
            particleData.velocities[i3 + 1] += 0.002; // Buoyancy for oxygen bubbles (increased for active reaction)
            particleData.velocities[i3 + 2] *= 0.99; // Horizontal damping
            
            // Add slight turbulence for natural bubble movement
            if (Math.random() > 0.8) { // More frequent turbulence for active reaction
              particleData.velocities[i3] += (Math.random() - 0.5) * 0.015; // Increased turbulence
              particleData.velocities[i3 + 2] += (Math.random() - 0.5) * 0.015; // Increased turbulence
            }
            
            // Bubble boundary - reset when they go too high
            if (positions[i3 + 1] > position[1] + 1.5) {
              particleData.velocities[i3 + 1] = 0;
              positions[i3 + 1] = position[1] - 0.4; // Reset to bottom near catalyst
              positions[i3] = position[0] + (Math.random() - 0.5) * 0.3; // Near center for catalyst effect
              positions[i3 + 2] = position[2] + (Math.random() - 0.5) * 0.3; // Near center for catalyst effect
            }
            break;
          case 'boiling':
            // Vigorous bubbling motion
            particleData.velocities[i3] *= 0.99;
            particleData.velocities[i3 + 1] += 0.001; // Strong buoyancy
            particleData.velocities[i3 + 2] *= 0.99;
            // Random turbulence
            if (Math.random() > 0.95) {
              particleData.velocities[i3] += (Math.random() - 0.5) * 0.02;
              particleData.velocities[i3 + 2] += (Math.random() - 0.5) * 0.02;
            }
            break;
          case 'precipitation':
            // Slower settling with slight horizontal movement for floating streaks
            particleData.velocities[i3] *= 0.95; // Gentle horizontal movement
            particleData.velocities[i3 + 1] -= 0.005; // Slow settling
            particleData.velocities[i3 + 2] *= 0.95; // Gentle horizontal movement
            
            // Add slight Brownian motion for realistic suspension
            if (Math.random() > 0.7) {
              particleData.velocities[i3] += (Math.random() - 0.5) * 0.01;
              particleData.velocities[i3 + 2] += (Math.random() - 0.5) * 0.01;
            }
            
            // Settling boundary - particles settle at the bottom
            if (positions[i3 + 1] < position[1] - 0.3) {
              particleData.velocities[i3 + 1] = 0;
              positions[i3 + 1] = position[1] - 0.3 + Math.random() * 0.02;
            }
            break;
          case 'heat-release':
            // Heat causes expansion and rising
            particleData.velocities[i3] *= 1.003;
            particleData.velocities[i3 + 1] += 0.001;
            particleData.velocities[i3 + 2] *= 1.003;
            break;
          case 'smoke':
            // Smoke rises slowly and disperses
            particleData.velocities[i3] *= 0.998;
            particleData.velocities[i3 + 1] += 0.0003; // Gentle buoyancy
            particleData.velocities[i3 + 2] *= 0.998;
            break;
        }

        // Color changes over time for color-change reactions
        if (effectType === 'color-change') {
          colors[i3] = Math.sin(elapsed * 3 + i) * 0.5 + 0.5
          colors[i3 + 1] = Math.cos(elapsed * 4 + i) * 0.5 + 0.5
          colors[i3 + 2] = Math.sin(elapsed * 5 + i) * 0.5 + 0.5
        }
        
        // Fade out particles over time
        const material = particlesRef.current.material as THREE.PointsMaterial
        material.opacity = Math.max(0, 0.9 - progress * 0.9)
      }

      geometry.attributes.position.needsUpdate = true
      geometry.attributes.color.needsUpdate = true
    }

    // Gas bubble animation
    if (gasRef.current && (effectType === 'gas-evolution' || effectType === 'boiling')) {
      gasRef.current.children.forEach((bubble, index) => {
        const time = elapsed + index * 0.3; // Slower timing for more realistic bubbles
        bubble.position.y += effectType === 'boiling' ? 0.04 : 0.02; // Rise upward
        bubble.scale.setScalar(1 + Math.sin(time * 2) * 0.1); // Subtle scale variation

        // More realistic bubble movement with slight horizontal drift
        bubble.position.x += Math.sin(time * 1.5) * 0.003;
        bubble.position.z += Math.cos(time * 1.2) * 0.003;

        // Reset bubble when it goes too high
        if (bubble.position.y > position[1] + 2) {
          bubble.position.y = position[1] - 0.5; // Reset to bottom near catalyst
          bubble.position.x = position[0] + (Math.random() - 0.5) * 0.2; // Near center for catalyst effect
          bubble.position.z = position[2] + (Math.random() - 0.5) * 0.2; // Near center for catalyst effect
          bubble.scale.setScalar(0.05 + Math.random() * 0.05); // Random initial size
        }
      });
    }

    // Color change effect
    if (colorChangeRef.current && (effectType === 'color-change' || effectType === 'acid-base')) {
      const material = colorChangeRef.current.material as THREE.MeshBasicMaterial
      if (effectType === 'acid-base') {
        // Special handling for acid-base (phenolphthalein) reaction
        const isBase = chemicals.includes('naoh')
        if (isBase) {
          material.color.setRGB(1.0, 0.4, 0.7) // Pink for base
        } else {
          material.color.setRGB(1.0, 1.0, 1.0) // Colorless for acid
        }
      } else {
        const hue = (elapsed * 0.3) % 1
        material.color.setHSL(hue, 0.8, 0.6)
      }
      material.opacity = 0.4 + Math.sin(elapsed * 4) * 0.1
    }

    // Boiling effect
    if (boilingRef.current && effectType === 'boiling') {
      boilingRef.current.children.forEach((bubble, index) => {
        const time = elapsed + index * 0.3
        bubble.position.y += 0.05
        bubble.scale.setScalar(1 + Math.sin(time * 4) * 0.4)

        // More vigorous reset for boiling
        if (bubble.position.y > position[1] + 2) {
          bubble.position.y = position[1] - 0.2
          bubble.position.x = position[0] + (Math.random() - 0.5) * 0.8
          bubble.position.z = position[2] + (Math.random() - 0.5) * 0.8
        }
      })
    }

    // Smoke effect
    if (smokeRef.current && effectType === 'smoke') {
      smokeRef.current.children.forEach((particle, index) => {
        const time = elapsed + index * 0.2
        particle.position.y += 0.01
        particle.scale.setScalar(1 + Math.sin(time * 2) * 0.5)

        // Rotate smoke particles
        particle.rotation.x += 0.01
        particle.rotation.y += 0.02

        // Reset when too high or after some time
        if (particle.position.y > position[1] + 4 || Math.random() > 0.995) {
          particle.position.y = position[1]
          particle.position.x = position[0] + (Math.random() - 0.5) * 1.0
          particle.position.z = position[2] + (Math.random() - 0.5) * 1.0
        }
      })
    }

    // Complete the reaction
    if (progress >= 1) {
      onComplete?.()
    }
  })

  // Initialize start time when activated
  if (isActive && startTime.current === 0) {
    startTime.current = performance.now() / 1000
  }

  if (!isActive) return null

  // Use effects data if provided, otherwise fallback to reactionType
  const currentEffectType = effects && effects.length > 0 ? effects[0].type : reactionType

  return (
    <group position={position}>
      {/* Main particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleData.particleCount}
            array={particleData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleData.particleCount}
            array={particleData.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleData.particleCount}
            array={particleData.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.85} // Slightly less opaque for more realistic appearance
          alphaTest={0.01}
          blending={THREE.NormalBlending} // Changed from AdditiveBlending for more realistic look
          sizeAttenuation
        />
      </points>

      {/* Gas evolution bubbles */}
      {(currentEffectType === 'gas-evolution' || currentEffectType === 'boiling') && (
        <group ref={gasRef}>
          {Array.from({ length: 20 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.4, // Closer to center for catalyst effect
                -0.4 + Math.random() * 0.3, // Start near bottom for catalyst effect
                (Math.random() - 0.5) * 0.4
              ]}
              scale={[0.03 + Math.random() * 0.07, 0.03 + Math.random() * 0.07, 0.03 + Math.random() * 0.07]} // Variable initial size
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshPhysicalMaterial
                color={currentEffectType === 'boiling' ? "#a0d0ff" : "#f0f8ff"} // More realistic oxygen bubble color
                transparent
                opacity={0.7} // Slightly more opaque for better visibility
                roughness={0.05}
                metalness={0.02}
                clearcoat={0.1}
                clearcoatRoughness={0.02}
                transmission={0.9}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Color change overlay */}
      {(currentEffectType === 'color-change' || currentEffectType === 'acid-base') && (
        <mesh ref={colorChangeRef} scale={[0.8, 0.2, 0.8]} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          <meshBasicMaterial
            color={currentEffectType === 'acid-base' ? "#ff69b4" : "#ff00ff"}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Heat shimmer effect */}
      {currentEffectType === 'heat-release' && (
        <group>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh
              key={i}
              position={[0, i * 0.12, 0]}
              rotation={[0, i * 0.6, 0]}
              scale={[0.12, 0.3, 0.12]}
            >
              <cylinderGeometry args={[1, 0.5, 1, 8]} />
              <meshBasicMaterial
                color="#ffaa44" // Softer orange-yellow color
                transparent
                opacity={0.3 - i * 0.02}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Boiling effect */}
      {currentEffectType === 'boiling' && (
        <group ref={boilingRef}>
          {Array.from({ length: 20 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.8,
                -0.2,
                (Math.random() - 0.5) * 0.8
              ]}
              scale={[0.1, 0.1, 0.1]}
            >
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial
                color="#a0d0ff"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Smoke effect */}
      {currentEffectType === 'smoke' && (
        <group ref={smokeRef}>
          {Array.from({ length: 15 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 1.0,
                0,
                (Math.random() - 0.5) * 1.0
              ]}
              scale={[0.3, 0.3, 0.3]}
            >
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial
                color="#aaaaaa"
                transparent
                opacity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}