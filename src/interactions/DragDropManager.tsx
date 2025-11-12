import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster, Object3D } from 'three';
import { usePhysics } from '../physics/PhysicsProvider';

export interface DragObject {
  id: string;
  object: Object3D;
  type: 'equipment' | 'chemical' | 'tool';
  initialPosition: Vector3;
  isDraggable: boolean;
  constraints?: {
    minY?: number;
    maxY?: number;
    minX?: number;
    maxX?: number;
    minZ?: number;
    maxZ?: number;
  };
}

export interface DragDropContextType {
  draggedObject: DragObject | null;
  hoveredObject: DragObject | null;
  isDragging: boolean;
  registerObject: (object: DragObject) => void;
  unregisterObject: (id: string) => void;
  startDrag: (object: DragObject) => void;
  endDrag: () => void;
}

export const DragDropContext = React.createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = React.useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  enabled = true,
}) => {
  const { camera, gl } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector3());
  const plane = useRef(new Vector3());

  const [draggedObject, setDraggedObject] = useState<DragObject | null>(null);
  const [hoveredObject, setHoveredObject] = useState<DragObject | null>(null);
  const [registeredObjects, setRegisteredObjects] = useState<Map<string, DragObject>>(new Map());

  const [isDragging, setIsDragging] = useState(false);
  const [dragPlaneY] = useState(1); // Y-coordinate of invisible drag plane

  const registerObject = useCallback((object: DragObject) => {
    setRegisteredObjects(prev => new Map(prev.set(object.id, object)));
  }, []);

  const unregisterObject = useCallback((id: string) => {
    setRegisteredObjects(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const getIntersection = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    // Cast against all registered objects
    const objects = Array.from(registeredObjects.values()).map(obj => obj.object);
    return raycaster.current.intersectObjects(objects, true);
  }, [camera, gl, registeredObjects]);

  const startDrag = useCallback((object: DragObject) => {
    if (!object.isDraggable) return;

    setDraggedObject(object);
    setIsDragging(true);

    // Store initial position for constraints
    object.initialPosition = object.object.position.clone();
  }, []);

  const endDrag = useCallback(() => {
    if (draggedObject) {
      // Apply any final constraints or snapping
      const { constraints } = draggedObject;
      if (constraints) {
        const pos = draggedObject.object.position;

        if (constraints.minY !== undefined) pos.y = Math.max(constraints.minY, pos.y);
        if (constraints.maxY !== undefined) pos.y = Math.min(constraints.maxY, pos.y);
        if (constraints.minX !== undefined) pos.x = Math.max(constraints.minX, pos.x);
        if (constraints.maxX !== undefined) pos.x = Math.min(constraints.maxX, pos.x);
        if (constraints.minZ !== undefined) pos.z = Math.max(constraints.minZ, pos.z);
        if (constraints.maxZ !== undefined) pos.z = Math.min(constraints.maxZ, pos.z);
      }
    }

    setDraggedObject(null);
    setIsDragging(false);
  }, [draggedObject]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const intersects = getIntersection(event.clientX, event.clientY);

    if (intersects.length > 0) {
      // Find the corresponding registered object
      const clickedObject = intersects[0].object;

      for (const [id, dragObject] of registeredObjects) {
        if (dragObject.object === clickedObject || dragObject.object.children.includes(clickedObject)) {
          startDrag(dragObject);
          break;
        }
      }
    }
  }, [enabled, getIntersection, registeredObjects, startDrag]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const intersects = getIntersection(event.clientX, event.clientY);

    if (isDragging && draggedObject) {
      // Calculate position on drag plane
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Create invisible plane for dragging
      const dragPlaneNormal = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      const dragPlanePoint = new Vector3(0, dragPlaneY, 0);

      const intersection = new Vector3();
      raycaster.current.ray.intersectPlane(
        new Vector3().setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPlanePoint),
        intersection
      );

      if (!isNaN(intersection.x) && !isNaN(intersection.y) && !isNaN(intersection.z)) {
        draggedObject.object.position.copy(intersection);
      }
    } else {
      // Handle hover
      const newHoveredObject = intersects.length > 0 ?
        Array.from(registeredObjects.values()).find(obj =>
          obj.object === intersects[0].object || obj.object.children.includes(intersects[0].object)
        ) : null;

      setHoveredObject(newHoveredObject || null);

      // Change cursor on hover
      gl.domElement.style.cursor = newHoveredObject?.isDraggable ? 'grab' : 'default';
    }
  }, [enabled, isDragging, draggedObject, getIntersection, registeredObjects, camera, gl, dragPlaneY]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (isDragging) {
      endDrag();
    }
  }, [isDragging, endDrag]);

  // Mouse event listeners
  useEffect(() => {
    if (!enabled) return;

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseDown, handleMouseMove, handleMouseUp, gl]);

  // Update cursor based on drag state
  useEffect(() => {
    if (isDragging) {
      gl.domElement.style.cursor = 'grabbing';
    } else if (hoveredObject?.isDraggable) {
      gl.domElement.style.cursor = 'grab';
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [isDragging, hoveredObject, gl]);

  const contextValue: DragDropContextType = {
    draggedObject,
    hoveredObject,
    isDragging,
    registerObject,
    unregisterObject,
    startDrag,
    endDrag,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
};

export default DragDropProvider;