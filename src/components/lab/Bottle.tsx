import { useRef, useState } from "react";
import { Group } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { toast } from "sonner";

interface BottleProps {
  position: [number, number, number];
  color: string;
  fillLevel: number;
}

export const Bottle = ({ position, color, fillLevel }: BottleProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toast.success(`Reagent Bottle - ${Math.round(fillLevel * 100)}% filled`);
  };

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.02);
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
      {/* Bottle Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 1.4, 32]} />
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

      {/* Bottle Bottom */}
      <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.1}
          transmission={0.8}
        />
      </mesh>

      {/* Bottle Neck */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.2, 0.4, 32]} />
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

      {/* Bottle Cap */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.15, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Cap Top */}
      <mesh position={[0, 1.225, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.05, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Liquid Inside */}
      <mesh position={[0, -0.7 + (fillLevel * 1.4) / 2, 0]}>
        <cylinderGeometry args={[0.33, 0.33, fillLevel * 1.35, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Label */}
      <mesh position={[0, 0, 0.36]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial
          color="#f8f9fa"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
