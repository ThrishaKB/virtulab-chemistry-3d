import { useRef, useState, useCallback } from "react";
import { Mesh, Group, Vector3 } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useBox, useCylinder } from "@react-three/cannon";
import { toast } from "sonner";
import { usePhysics } from "../../physics/PhysicsProvider";

interface BeakerProps {
  position: [number, number, number];
  volume?: number; // Current liquid volume in mL
  maxVolume?: number; // Maximum capacity in mL
  liquidColor?: string; // Color of liquid content
  isDraggable?: boolean;
  onPourStart?: () => void;
  onPourEnd?: (pouredVolume: number) => void;
  // Legacy props for backward compatibility
  color?: string;
  fillLevel?: number;
}

export const Beaker = ({ position, color, fillLevel }: BeakerProps) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toast.success(`Beaker selected - ${Math.round(fillLevel * 100)}% filled`);
  };

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.002;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
      }}
      onPointerUp={() => setIsDragging(false)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Glass Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.35, 1, 32, 1, true]} />
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

      {/* Glass Bottom */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
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

      {/* Liquid Inside */}
      <mesh position={[0, -0.5 + (fillLevel * 1) / 2, 0]}>
        <cylinderGeometry args={[0.35, 0.33, fillLevel * 0.95, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Rim */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.4, 0.02, 16, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Measurement Marks */}
      {[0.2, 0, -0.2].map((y, i) => (
        <mesh key={i} position={[0.36, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
};
