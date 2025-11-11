import { useRef, useState } from "react";
import { Group } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { toast } from "sonner";

interface FlaskProps {
  position: [number, number, number];
  color: string;
  fillLevel: number;
}

export const Flask = ({ position, color, fillLevel }: FlaskProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toast.success(`Erlenmeyer Flask - ${Math.round(fillLevel * 100)}% filled`);
  };

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Flask Body (Conical) */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[0.5, 1.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Flask Bottom */}
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.1}
          transmission={0.8}
        />
      </mesh>

      {/* Flask Neck */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.3}
        />
      </mesh>

      {/* Neck Rim */}
      <mesh position={[0, 1.1, 0]}>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Liquid Inside */}
      <mesh position={[0, -0.6 + (fillLevel * 1.2) / 2, 0]}>
        <coneGeometry args={[0.48 * fillLevel, fillLevel * 1.15, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
