import { useRef, useState } from "react";
import { Group } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { toast } from "sonner";

interface TestTubeProps {
  position: [number, number, number];
  color: string;
  fillLevel: number;
}

export const TestTube = ({ position, color, fillLevel }: TestTubeProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toast.success(`Test Tube - ${Math.round(fillLevel * 100)}% filled`);
  };

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y += Math.sin(Date.now() * 0.005) * 0.002;
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
      {/* Test Tube Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 32]} />
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

      {/* Rounded Bottom */}
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
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

      {/* Top Rim */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.15, 0.015, 16, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Liquid Inside */}
      <mesh position={[0, -0.6 + (fillLevel * 1.15) / 2, 0]}>
        <cylinderGeometry args={[0.14, 0.14, fillLevel * 1.15, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.75}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Liquid Bottom (rounded) */}
      {fillLevel > 0 && (
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.14, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.75}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
};
