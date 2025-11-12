import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types/experiment'

interface PouringEffectProps {
  fromPosition: THREE.Vector3
  toPosition: THREE.Vector3
  chemical: Chemical
  isActive: boolean
  onComplete?: () => void
}

export default function PouringEffect({
  fromPosition,
  toPosition,
  chemical,
  isActive,
  onComplete,
}: PouringEffectProps) {
  const streamRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    if (isActive) {
      progressRef.current = 0
      const timer = setTimeout(() => {
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  useFrame((state, delta) => {
    if (!streamRef.current || !isActive) return
    
    progressRef.current += delta * 0.5
    
    if (progressRef.current >= 1) {
      progressRef.current = 1
    }
    
    const opacity = Math.sin(progressRef.current * Math.PI)
    const material = streamRef.current.material as THREE.MeshPhysicalMaterial
    material.opacity = opacity * 0.6
  })

  if (!isActive) return null

  const direction = new THREE.Vector3()
    .subVectors(toPosition, fromPosition)
  const distance = direction.length()
  const midpoint = new THREE.Vector3()
    .addVectors(fromPosition, toPosition)
    .multiplyScalar(0.5)

  return (
    <mesh ref={streamRef} position={[midpoint.x, midpoint.y, midpoint.z]}>
      <cylinderGeometry args={[0.05, 0.05, distance, 8]} />
      <meshPhysicalMaterial
        color={chemical.color}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}
