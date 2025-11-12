import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ReactionEffectProps {
  position: [number, number, number]
  reactionType: 'acid-base' | 'precipitation' | 'gas-evolution' | 'color-change' | 'heat-release'
  intensity: number
  isActive: boolean
  chemicals: string[]
  onComplete?: () => void
}

export default function ReactionEffect({
  position,
  reactionType,
  intensity,
  isActive,
  onComplete,
}: ReactionEffectProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  useFrame((state, delta) => {
    if (!particlesRef.current || !isActive) return
    
    timeRef.current += delta
    particlesRef.current.rotation.y += delta * 0.5
    
    const scale = 1 + Math.sin(timeRef.current * 2) * 0.2
    particlesRef.current.scale.set(scale, scale, scale)
  })

  const getColor = () => {
    switch (reactionType) {
      case 'acid-base': return '#ff00ff'
      case 'precipitation': return '#ffffff'
      case 'gas-evolution': return '#00ff00'
      case 'heat-release': return '#ff6600'
      default: return '#00ffff'
    }
  }

  const particleCount = 100
  const positions = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2
  }

  if (!isActive) return null

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={getColor()}
        transparent
        opacity={intensity}
        sizeAttenuation
      />
      <pointLight intensity={intensity * 2} distance={3} color={getColor()} />
    </points>
  )
}
