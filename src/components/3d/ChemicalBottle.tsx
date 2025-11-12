'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { Chemical } from '@/types'

interface ChemicalBottleProps {
  chemical: Chemical
  position: [number, number, number]
  scale?: [number, number, number]
  onPour?: (chemical: Chemical) => void
  isPouringMode?: boolean
}

export default function ChemicalBottle({
  chemical,
  position,
  scale = [1, 1, 1],
  onPour,
  isPouringMode = false
}: ChemicalBottleProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  
  // Create bottle geometry
  const bottleGeometry = useMemo(() => {
    const group = new THREE.Group()
    
    // Main bottle body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.8, 12)
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: '#f0f0f0',
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.1
    group.add(body)
    
    // Bottle neck
    const neckGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.3, 8)
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial)
    neck.position.y = 0.65
    group.add(neck)
    
    // Cap
    const capGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8)
    const capMaterial = new THREE.MeshPhongMaterial({ color: '#333333' })
    const cap = new THREE.Mesh(capGeometry, capMaterial)
    cap.position.y = 0.85
    group.add(cap)
    
    // Chemical liquid inside
    const liquidGeometry = new THREE.CylinderGeometry(0.13, 0.16, 0.6, 12)
    const liquidMaterial = new THREE.MeshPhongMaterial({
      color: chemical.color,
      transparent: true,
      opacity: 0.8
    })
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial)
    liquid.position.y = 0.0
    group.add(liquid)
    
    // Label background
    const labelGeometry = new THREE.PlaneGeometry(0.25, 0.15)
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.9
    })
    const label = new THREE.Mesh(labelGeometry, labelMaterial)
    label.position.set(0, 0.2, 0.181)
    group.add(label)
    
    return group
  }, [chemical.color])

  const handleClick = (event: any) => {
    event.stopPropagation()
    console.log(`Clicked ${chemical.name} - adding to beaker`)
    if (onPour) {
      onPour(chemical)
      setIsSelected(true)
      // Reset selection after a moment
      setTimeout(() => setIsSelected(false), 1000)
    }
  }

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation when hovered
      if (isHovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05
        meshRef.current.scale.setScalar(1.1)
      } else {
        meshRef.current.position.y = position[1]
        meshRef.current.scale.setScalar(1)
      }
      
      // Selection effect
      if (isSelected) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1
      } else {
        meshRef.current.rotation.z = 0
      }
      
      // Pouring mode highlight
      if (isPouringMode) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2
      }
    }
  })

  return (
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
        setShowLabel(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
        setShowLabel(false)
        document.body.style.cursor = 'default'
      }}
      onClick={handleClick}
    >
      <primitive object={bottleGeometry} />
      
      {/* Chemical label */}
      {showLabel && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm pointer-events-none shadow-lg">
            <div className="font-semibold">{chemical.name}</div>
            <div className="text-xs text-gray-300">{chemical.formula}</div>
            {chemical.concentration && (
              <div className="text-xs text-blue-300">
                {(chemical.concentration * 100).toFixed(1)}M
              </div>
            )}
          </div>
        </Html>
      )}
      
      {/* Click instruction */}
      {isHovered && (
        <Html position={[0, 1.6, 0]} center>
          <div className="bg-green-600/90 text-white px-3 py-1 rounded text-xs pointer-events-none animate-bounce">
            ✨ Click to add to beaker ✨
          </div>
        </Html>
      )}
      
      {/* Selection feedback */}
      {isSelected && (
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-blue-600/90 text-white px-3 py-1 rounded text-xs pointer-events-none animate-pulse">
            ✅ Added to beaker!
          </div>
        </Html>
      )}
      
      {/* Glow ring when hovered */}
      {isHovered && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial 
            color="#00ff88" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  )
}