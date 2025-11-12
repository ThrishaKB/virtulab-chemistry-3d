import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Group, Vector3 } from "three";

interface DraggableEquipmentProps {
  id: string;
  type: "beaker" | "flask" | "test-tube" | "burner";
  position: [number, number, number];
  onPlace: (equipmentId: string, position: Vector3) => void;
  currentLiquid?: {
    color: string;
    level: number;
  };
}

export const DraggableEquipment = ({
  id,
  type,
  position,
  onPlace,
  currentLiquid,
}: DraggableEquipmentProps) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
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
    if (groupRef.current) {
      onPlace(id, groupRef.current.position);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && groupRef.current) {
      groupRef.current.position.x = e.point.x + dragOffset.current.x;
      groupRef.current.position.y = Math.max(1, e.point.y + dragOffset.current.y);
      groupRef.current.position.z = e.point.z + dragOffset.current.z;
    }
  };

  useFrame(() => {
    if (groupRef.current && hovered && !isDragging) {
      groupRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.02);
    } else if (groupRef.current && !isDragging) {
      groupRef.current.scale.setScalar(1);
    }
  });

  const renderEquipment = () => {
    switch (type) {
      case "beaker":
        return (
          <>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.05}
                transmission={0.9}
              />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.29, 0.29, 0.02, 32]} />
              <meshStandardMaterial color="#e0e0e0" />
            </mesh>
            {currentLiquid && (
              <mesh position={[0, -0.4 + currentLiquid.level * 0.4, 0]}>
                <cylinderGeometry args={[0.28, 0.28, currentLiquid.level * 0.8, 32]} />
                <meshPhysicalMaterial
                  color={currentLiquid.color}
                  transparent
                  opacity={0.7}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            )}
          </>
        );

      case "flask":
        return (
          <>
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.35, 0.7, 32]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.05}
                transmission={0.9}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                transmission={0.9}
              />
            </mesh>
            {currentLiquid && (
              <mesh position={[0, -0.2, 0]}>
                <coneGeometry args={[0.33, currentLiquid.level * 0.7, 32]} />
                <meshPhysicalMaterial
                  color={currentLiquid.color}
                  transparent
                  opacity={0.7}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            )}
          </>
        );

      case "test-tube":
        return (
          <>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.05}
                transmission={0.9}
              />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                transmission={0.9}
              />
            </mesh>
            {currentLiquid && (
              <mesh position={[0, -0.35 + currentLiquid.level * 0.35, 0]}>
                <cylinderGeometry args={[0.09, 0.09, currentLiquid.level * 0.7, 16]} />
                <meshPhysicalMaterial
                  color={currentLiquid.color}
                  transparent
                  opacity={0.7}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            )}
          </>
        );

      case "burner":
        return (
          <>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
            </mesh>
          </>
        );

      default:
        return null;
    }
  };

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
      {renderEquipment()}
      {hovered && !isDragging && (
        <pointLight position={[0, 0.5, 0]} intensity={0.3} distance={2} color="#00ffff" />
      )}
    </group>
  );
};
