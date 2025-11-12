'use client'
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types'

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
  onComplete
}: PouringEffectProps) {
  const groupRef = useRef<THREE.Group>(null)
  const streamRef = useRef<THREE.Mesh>(null)
  const splashRef = useRef<THREE.Points>(null)
  
  // Create liquid stream geometry
  const streamGeometry = useMemo(() => {
    const points = []
    const distance = fromPosition.distanceTo(toPosition)
    const segments = Math.max(10, Math.floor(distance * 5))
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = THREE.MathUtils.lerp(fromPosition.x, toPosition.x, t)
      const z = THREE.MathUtils.lerp(fromPosition.z, toPosition.z, t)
      
      // Parabolic fall for realistic liquid stream
      const height = fromPosition.y + (toPosition.y - fromPosition.y) * t - 0.5 * 9.8 * t * t * 0.1
      
      points.push(new THREE.Vector3(x, height, z))
    }
    
    const curve = new THREE.CatmullRomCurve3(points)
    const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.02, 6, false)
    
    return tubeGeometry
  }, [fromPosition, toPosition])
  
  // Create splash particles
  const splashGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const velocities = []
    
    // Create splash particles around the target position
    for (let i = 0; i < 50; i++) {
      positions.push(
        toPosition.x + (Math.random() - 0.5) * 0.2,
        toPosition.y + Math.random() * 0.1,
        toPosition.z + (Math.random() - 0.5) * 0.2
      )
      
      velocities.push(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.05,
        (Math.random() - 0.5) * 0.1
      )
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3))
    
    return geometry
  }, [toPosition])
  
  const streamMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: chemical.color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
  }, [chemical.color])
  
  const splashMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: chemical.color,
      size: 0.02,
      transparent: true,
      opacity: 0.6
    })
  }, [chemical.color])
  
  useFrame((state, delta) => {
    if (!isActive) return
    
    // Animate stream visibility
    if (streamRef.current) {
      const material = streamRef.current.material as THREE.MeshPhongMaterial
      material.opacity = Math.sin(state.clock.elapsedTime * 10) * 0.3 + 0.7
    }
    
    // Animate splash particles
    if (splashRef.current) {
      const positions = splashRef.current.geometry.attributes.position.array as Float32Array
      const velocities = splashRef.current.geometry.attributes.velocity.array as Float32Array
      
      for (let i = 0; i < positions.length; i += 3) {
        // Update positions based on velocities
        positions[i] += velocities[i] * delta
        positions[i + 1] += velocities[i + 1] * delta - 0.98 * delta * delta // gravity
        positions[i + 2] += velocities[i + 2] * delta
        
        // Reset particles that fall too low
        if (positions[i + 1] < toPosition.y - 0.5) {
          positions[i] = toPosition.x + (Math.random() - 0.5) * 0.2
          positions[i + 1] = toPosition.y + Math.random() * 0.1
          positions[i + 2] = toPosition.z + (Math.random() - 0.5) * 0.2
          
          velocities[i] = (Math.random() - 0.5) * 0.1
          velocities[i + 1] = Math.random() * 0.05
          velocities[i + 2] = (Math.random() - 0.5) * 0.1
        }
      }
      
      splashRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef}>
      {/* Liquid stream */}
      <mesh ref={streamRef} geometry={streamGeometry} material={streamMaterial} />
      
      {/* Splash particles */}
      <points ref={splashRef} geometry={splashGeometry} material={splashMaterial} />
    </group>
  )
}