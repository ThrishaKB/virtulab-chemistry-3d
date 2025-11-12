import React, { useRef, useEffect, useCallback } from 'react';
import { Object3D, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useDragDrop } from './DragDropManager';
import { toast } from 'sonner';

export interface InteractiveObjectProps {
  id: string;
  type: 'equipment' | 'chemical' | 'tool';
  children: React.ReactNode;
  isDraggable?: boolean;
  constraints?: {
    minY?: number;
    maxY?: number;
    minX?: number;
    maxX?: number;
    minZ?: number;
    maxZ?: number;
  };
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onHover?: (isHovered: boolean) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  dragPlaneY?: number;
  enableHoverEffects?: boolean;
  hoverScale?: number;
  hoverEmission?: string;
  hoverIntensity?: number;
}

export const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  id,
  type,
  children,
  isDraggable = true,
  constraints,
  onDragStart,
  onDragEnd,
  onHover,
  onClick,
  onDoubleClick,
  dragPlaneY = 1,
  enableHoverEffects = true,
  hoverScale = 1.05,
  hoverEmission = '#ffffff',
  hoverIntensity = 0.1,
}) => {
  const groupRef = useRef<Group>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragged, setIsDragged] = React.useState(false);

  const {
    draggedObject,
    hoveredObject,
    registerObject,
    unregisterObject,
    startDrag,
    endDrag,
  } = useDragDrop();

  // Generate drag object from group
  const dragObject = React.useMemo(() => {
    if (!groupRef.current) return null;

    return {
      id,
      object: groupRef.current,
      type,
      initialPosition: groupRef.current.position.clone(),
      isDraggable,
      constraints: {
        minY: dragPlaneY - 0.5, // Keep objects above table
        ...constraints,
      },
    };
  }, [id, type, isDraggable, constraints, dragPlaneY]);

  // Register/unregister object
  useEffect(() => {
    if (dragObject) {
      registerObject(dragObject);
      return () => unregisterObject(id);
    }
  }, [dragObject, registerObject, unregisterObject, id]);

  // Handle drag state changes
  useEffect(() => {
    const wasDragged = isDragged;
    const currentlyDragged = draggedObject?.id === id;

    if (!wasDragged && currentlyDragged) {
      setIsDragged(true);
      onDragStart?.();
      toast.info(`Started dragging ${type}`);
    } else if (wasDragged && !currentlyDragged) {
      setIsDragged(false);
      onDragEnd?.();
    }
  }, [draggedObject, id, isDragged, onDragStart, onDragEnd, type]);

  // Handle hover state changes
  useEffect(() => {
    const wasHovered = isHovered;
    const currentlyHovered = hoveredObject?.id === id;

    if (!wasHovered && currentlyHovered) {
      setIsHovered(true);
      onHover?.(true);
    } else if (wasHovered && !currentlyHovered) {
      setIsHovered(false);
      onHover?.(false);
    }
  }, [hoveredObject, id, isHovered, onHover]);

  // Apply hover effects
  useFrame(() => {
    if (!groupRef.current || !enableHoverEffects) return;

    const targetScale = isHovered ? hoverScale : 1;
    const currentScale = groupRef.current.scale.x;

    // Smooth scaling animation
    if (Math.abs(currentScale - targetScale) > 0.001) {
      const newScale = currentScale + (targetScale - currentScale) * 0.1;
      groupRef.current.scale.setScalar(newScale);
    }

    // Apply emission effect to all child meshes
    groupRef.current.traverse((child) => {
      if (child.type === 'Mesh' && 'material' in child) {
        const material = child.material as any;
        if (material && 'emissive' in material) {
          const targetIntensity = isHovered ? hoverIntensity : 0;
          const currentIntensity = material.emissiveIntensity || 0;

          if (Math.abs(currentIntensity - targetIntensity) > 0.001) {
            const newIntensity = currentIntensity + (targetIntensity - currentIntensity) * 0.1;
            material.emissiveIntensity = newIntensity;

            if (newIntensity > 0) {
              material.emissive.set(hoverEmission);
            }
          }
        }
      }
    });
  });

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onClick?.();
  }, [onClick]);

  const handleDoubleClick = useCallback((event: any) => {
    event.stopPropagation();
    onDoubleClick?.();
  }, [onDoubleClick]);

  // Apply visual feedback for drag state
  const dragOpacity = isDragged ? 0.7 : 1;
  const dragRotation = isDragged ? Math.PI * 0.05 : 0;

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      userData={{
        id,
        type,
        isDraggable,
        isInteractive: true,
      }}
    >
      <group
        rotation-z={dragRotation}
        opacity={dragOpacity}
      >
        {children}
      </group>

      {/* Hover indicator */}
      {isHovered && isDraggable && (
        <group>
          {/* Selection outline */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      )}

      {/* Drag indicator */}
      {isDragged && (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <ringGeometry args={[0.05, 0.1, 16]} />
            <meshBasicMaterial
              color="#ff8800"
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default InteractiveObject;