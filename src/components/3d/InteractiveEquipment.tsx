'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Html } from '@react-three/drei'

interface InteractiveEquipmentProps {
  children: React.ReactNode
  equipmentId: string
  equipmentType: string
  onDragStart?: () => void
  onDragEnd?: () => void
  onPour?: (target: string) => void
  canReceiveLiquid?: boolean
  position: [number, number, number]
}

export default function InteractiveEquipment({
  children,
  equipmentId,
  equipmentType,
  onDragStart,
  onDragEnd,
  onPour,
  canReceiveLiquid = true,
  position
}: InteractiveEquipmentProps) {
  const groupRef = useRef<Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation when hovered
      if (isHovered && !isDragging) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.01
      }
      
      // Selection glow effect
      if (isSelected) {
        groupRef.current.scale.setScalar(1.02 + Math.sin(state.clock.elapsedTime * 4) * 0.01)
      } else {
        groupRef.current.scale.setScalar(1)
      }
    }
  })

  const handlePointerDown = (event: any) => {
    event.stopPropagation()
    setIsDragging(true)
    setIsSelected(true)
    onDragStart?.()
    
    // Capture pointer for smooth dragging
    event.target.setPointerCapture(event.pointerId)
  }

  const handlePointerUp = (event: any) => {
    event.stopPropagation()
    setIsDragging(false)
    onDragEnd?.()
    
    // Release pointer capture
    event.target.releasePointerCapture(event.pointerId)
  }

  const handlePointerOver = (event: any) => {
    event.stopPropagation()
    setIsHovered(true)
    setShowTooltip(true)
    document.body.style.cursor = 'grab'
  }

  const handlePointerOut = (event: any) => {
    event.stopPropagation()
    setIsHovered(false)
    setShowTooltip(false)
    if (!isDragging) {
      setIsSelected(false)
      document.body.style.cursor = 'default'
    }
  }

  const handlePointerMove = (event: any) => {
    if (isDragging) {
      event.stopPropagation()
      document.body.style.cursor = 'grabbing'
    }
  }

  const handleDoubleClick = (event: any) => {
    event.stopPropagation()
    
    // Double-click to rotate equipment
    if (groupRef.current) {
      groupRef.current.rotation.y += Math.PI / 4
    }
  }

  return (
    <group
      ref={groupRef}
      position={position}
      userData={{
        equipmentId,
        equipmentType,
        draggable: true,
        canReceiveLiquid
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerMove}
      onDoubleClick={handleDoubleClick}
    >
      {children}
      
      {/* Selection Ring */}
      {isSelected && (
        <mesh
          position={[0, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.6}
            depthTest={false}
          />
        </mesh>
      )}

      {/* Drag Helper */}
      {isDragging && (
        <Html
          position={[0, 3, 0]}
          center
          distanceFactor={8}
        >
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Dragging {equipmentType}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}