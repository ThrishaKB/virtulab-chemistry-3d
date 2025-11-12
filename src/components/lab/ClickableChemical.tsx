import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group } from "three";

interface ClickableChemicalProps {
  id: string;
  name: string;
  formula: string;
  color: string;
  position: [number, number, number];
  onAdd: (chemicalId: string) => void;
}

export const ClickableChemical = ({
  id,
  name,
  formula,
  color,
  position,
  onAdd,
}: ClickableChemicalProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.02;
    } else if (groupRef.current) {
      groupRef.current.position.y = position[1];
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onAdd(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* Bottle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
        />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.35, 16]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Bottle cap */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0, 0.16]}
        fontSize={0.06}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {formula}
      </Text>

      {/* Glow effect when hovered */}
      {hovered && (
        <>
          <pointLight
            position={[0, 0, 0]}
            intensity={0.8}
            distance={2}
            color={color}
          />
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.55, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2}
            />
          </mesh>
        </>
      )}
    </group>
  );
};
