import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { FlameEffect } from "./FlameEffect";

interface BunsenBurnerProps {
  position: [number, number, number];
  isLit: boolean;
  flameIntensity: number;
  onLight: () => void;
}

export const BunsenBurner = ({
  position,
  isLit,
  flameIntensity,
  onLight,
}: BunsenBurnerProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Burner Top */}
      <mesh
        position={[0, 0.15, 0]}
        castShadow
        onClick={onLight}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
        <meshStandardMaterial
          color={hovered ? "#ff8800" : "#3a3a3a"}
          metalness={0.7}
          roughness={0.2}
          emissive={isLit ? "#ff6600" : "#000000"}
          emissiveIntensity={isLit ? 0.3 : 0}
        />
      </mesh>

      {/* Gas Control Valve */}
      <mesh position={[0.15, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Flame Effect */}
      {isLit && (
        <FlameEffect
          position={[0, 0.25, 0]}
          intensity={flameIntensity}
          height={0.3 + flameIntensity * 0.5}
        />
      )}

      {/* Interactive glow when hovered */}
      {hovered && (
        <pointLight position={[0, 0.2, 0]} intensity={0.5} distance={1.5} color="#00ffff" />
      )}
    </group>
  );
};
