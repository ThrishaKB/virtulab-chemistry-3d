import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, Vector3 } from "three";

interface DraggableChemicalProps {
  id: string;
  name: string;
  formula: string;
  color: string;
  position: [number, number, number];
  onPour: (chemicalId: string, position: Vector3) => void;
}

export const DraggableChemical = ({
  id,
  name,
  formula,
  color,
  position,
  onPour,
}: DraggableChemicalProps) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dragOffset = useRef(new Vector3());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    if (groupRef.current) {
      dragOffset.current.copy(groupRef.current.position).sub(
        new Vector3(e.point.x, e.point.y, e.point.z)
      );
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    
    // Check if we're over a container (beaker, flask, etc.)
    if (groupRef.current && Math.abs(groupRef.current.rotation.z) > 0.5) {
      setIsPouring(true);
      onPour(id, groupRef.current.position);
      
      // Reset after pouring animation
      setTimeout(() => {
        setIsPouring(false);
        if (groupRef.current) {
          groupRef.current.rotation.z = 0;
          groupRef.current.position.set(...position);
        }
      }, 1000);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && groupRef.current) {
      groupRef.current.position.x = e.point.x + dragOffset.current.x;
      groupRef.current.position.y = e.point.y + dragOffset.current.y;
      groupRef.current.position.z = Math.max(0, e.point.z + dragOffset.current.z);
    }
  };

  useFrame(() => {
    if (groupRef.current && isDragging) {
      // Tilt bottle when dragging (pour gesture)
      groupRef.current.rotation.z += (0.8 - groupRef.current.rotation.z) * 0.1;
    } else if (groupRef.current && !isPouring) {
      // Return to upright position
      groupRef.current.rotation.z += (0 - groupRef.current.rotation.z) * 0.1;
    }
    
    if (groupRef.current && hovered && !isDragging) {
      groupRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.001;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Bottle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
        />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 16]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Bottle cap */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0, 0.16]}
        fontSize={0.08}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {formula}
      </Text>

      {/* Glow effect when hovered */}
      {hovered && (
        <pointLight
          position={[0, 0, 0]}
          intensity={0.5}
          distance={2}
          color={color}
        />
      )}
    </group>
  );
};
