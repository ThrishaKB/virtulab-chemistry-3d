'use client'

import { useRef, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Vector2, Euler, Raycaster, Object3D } from 'three'

interface InteractionState {
  isDragging: boolean
  draggedObject: Object3D | null
  dragOffset: Vector3
  hoverObject: Object3D | null
  pouringFrom: string | null
  pouringTo: string | null
}

export function useEquipmentInteraction() {
  const { camera, gl, scene } = useThree()
  const raycaster = useRef(new Raycaster())
  const mouse = useRef(new Vector2())
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isDragging: false,
    draggedObject: null,
    dragOffset: new Vector3(),
    hoverObject: null,
    pouringFrom: null,
    pouringTo: null
  })

  const getMousePosition = useCallback((event: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }, [gl])

  const getIntersectedObject = useCallback((event: PointerEvent) => {
    getMousePosition(event)
    raycaster.current.setFromCamera(mouse.current, camera)
    
    // Get all draggable objects (equipment)
    const draggableObjects: Object3D[] = []
    scene.traverse((child) => {
      if (child.userData.draggable) {
        draggableObjects.push(child)
      }
    })

    const intersects = raycaster.current.intersectObjects(draggableObjects, true)
    return intersects.length > 0 ? intersects[0].object : null
  }, [camera, scene, getMousePosition])

  const startDrag = useCallback((event: PointerEvent) => {
    const intersectedObject = getIntersectedObject(event)
    if (intersectedObject) {
      // Find the parent equipment group
      let equipmentGroup = intersectedObject
      while (equipmentGroup.parent && !equipmentGroup.userData.equipmentId) {
        equipmentGroup = equipmentGroup.parent
      }

      if (equipmentGroup.userData.equipmentId) {
        // Calculate offset from object center to click point
        raycaster.current.setFromCamera(mouse.current, camera)
        const intersects = raycaster.current.intersectObject(intersectedObject, true)
        if (intersects.length > 0) {
          const offset = new Vector3()
          offset.subVectors(equipmentGroup.position, intersects[0].point)
          
          setInteractionState(prev => ({
            ...prev,
            isDragging: true,
            draggedObject: equipmentGroup,
            dragOffset: offset
          }))
        }
      }
    }
  }, [getIntersectedObject, camera])

  const updateDrag = useCallback((event: PointerEvent) => {
    if (!interactionState.isDragging || !interactionState.draggedObject) return

    getMousePosition(event)
    raycaster.current.setFromCamera(mouse.current, camera)
    
    // Create a plane at the lab table height for dragging
    const plane = new Vector3(0, 1, 0)
    const planePosition = new Vector3(0, -1.2, 0)
    const target = new Vector3()
    
    // Calculate intersection with the drag plane
    const direction = raycaster.current.ray.direction.clone()
    const distance = planePosition.clone().sub(raycaster.current.ray.origin).dot(plane) / direction.dot(plane)
    target.copy(raycaster.current.ray.origin).add(direction.multiplyScalar(distance))
    
    // Apply the offset and update position
    target.add(interactionState.dragOffset)
    interactionState.draggedObject.position.copy(target)
    
    // Constrain to lab table bounds
    interactionState.draggedObject.position.x = Math.max(-5, Math.min(5, interactionState.draggedObject.position.x))
    interactionState.draggedObject.position.z = Math.max(-3, Math.min(3, interactionState.draggedObject.position.z))
    interactionState.draggedObject.position.y = -1.2 // Keep on table surface
    
  }, [interactionState.isDragging, interactionState.draggedObject, interactionState.dragOffset, camera, getMousePosition])

  const endDrag = useCallback(() => {
    if (interactionState.draggedObject) {
      // Check for pouring interactions
      checkPouringInteraction()
    }
    
    setInteractionState(prev => ({
      ...prev,
      isDragging: false,
      draggedObject: null,
      dragOffset: new Vector3()
    }))
  }, [interactionState.draggedObject])

  const checkPouringInteraction = useCallback(() => {
    if (!interactionState.draggedObject) return

    // Find nearby equipment for pouring
    const draggedPosition = interactionState.draggedObject.position
    let nearestEquipment: Object3D | null = null
    let minDistance = Infinity

    scene.traverse((child) => {
      if (child.userData.equipmentId && 
          child.userData.equipmentId !== interactionState.draggedObject?.userData.equipmentId &&
          child.userData.canReceiveLiquid) {
        const distance = draggedPosition.distanceTo(child.position)
        if (distance < 2 && distance < minDistance) {
          minDistance = distance
          nearestEquipment = child
        }
      }
    })

    if (nearestEquipment && minDistance < 1.5) {
      // Trigger pouring animation
      setInteractionState(prev => ({
        ...prev,
        pouringFrom: interactionState.draggedObject?.userData.equipmentId || null,
        pouringTo: nearestEquipment?.userData.equipmentId || null
      }))
      
      // Auto-clear pouring state after animation
      setTimeout(() => {
        setInteractionState(prev => ({
          ...prev,
          pouringFrom: null,
          pouringTo: null
        }))
      }, 3000)
    }
  }, [interactionState.draggedObject, scene])

  const handleHover = useCallback((event: PointerEvent) => {
    if (interactionState.isDragging) return

    const intersectedObject = getIntersectedObject(event)
    setInteractionState(prev => ({
      ...prev,
      hoverObject: intersectedObject
    }))
  }, [interactionState.isDragging, getIntersectedObject])

  const rotateEquipment = useCallback((equipmentId: string, rotation: Euler) => {
    scene.traverse((child) => {
      if (child.userData.equipmentId === equipmentId) {
        child.rotation.copy(rotation)
      }
    })
  }, [scene])

  return {
    interactionState,
    startDrag,
    updateDrag,
    endDrag,
    handleHover,
    rotateEquipment
  }
}