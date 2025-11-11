import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface FloatingScreenProps {
  position: [number, number, number];
  text: string;
  color?: string;
}

export const FloatingScreen = ({ position, text, color = "#00ffff" }: FloatingScreenProps) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Screen panel */}
      <mesh>
        <planeGeometry args={[1.2, 0.8]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.15}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Screen border */}
      <mesh>
        <planeGeometry args={[1.25, 0.85]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* Text */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {text}
      </Text>

      {/* Glow effect */}
      <pointLight
        color={color}
        intensity={0.3}
        distance={1.5}
      />

      {/* Support stand */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};
