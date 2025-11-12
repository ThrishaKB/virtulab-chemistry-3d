import { useRef, useState, useCallback } from "react";
import { Group, Vector3 } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useCylinder, useSphere } from "@react-three/cannon";
import { toast } from "sonner";
import { usePhysics } from "../../physics/PhysicsProvider";

interface TestTubeProps {
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

export const TestTube = ({
  position,
  volume = 25,
  maxVolume = 50,
  liquidColor = "#8b5cf6",
  isDraggable = true,
  onPourStart,
  onPourEnd,
  // Legacy props for backward compatibility
  color,
  fillLevel
}: TestTubeProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  // Backward compatibility: use fillLevel if volume is not provided
  const normalizedFillLevel = fillLevel !== undefined ? fillLevel : currentVolume / maxVolume;

  const { materials } = usePhysics();

  // Physics body for the test tube body (cylinder shape)
  const [tubeBodyRef, tubeBodyApi] = useCylinder(() => ({
    mass: isDraggable ? 0.2 : 0, // Very light for easy manipulation
    position,
    material: materials.glass,
    args: [0.15, 0.15, 1.2, 8], // [radiusTop, radiusBottom, height, numSegments]
    type: isDraggable ? 'Dynamic' : 'Static',
  }), null);

  // Physics body for the rounded bottom (sphere shape)
  const [tubeBottomRef, tubeBottomApi] = useSphere(() => ({
    mass: isDraggable ? 0.05 : 0,
    position: [position[0], position[1] - 0.6, position[2]],
    material: materials.glass,
    args: [0.15], // [radius]
    type: isDraggable ? 'Dynamic' : 'Static',
  }), null);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const fillPercentage = Math.round(normalizedFillLevel * 100);
    toast.success(`Test Tube - ${fillPercentage}% filled (${currentVolume}mL/${maxVolume}mL)`);
  }, [normalizedFillLevel, currentVolume, maxVolume]);

  const handlePourStart = useCallback(() => {
    if (currentVolume > 0 && !isPouring) {
      setIsPouring(true);
      onPourStart?.();
    }
  }, [currentVolume, isPouring, onPourStart]);

  const handlePourEnd = useCallback((pouredVolume: number) => {
    setIsPouring(false);
    const newVolume = Math.max(0, currentVolume - pouredVolume);
    setCurrentVolume(newVolume);
    onPourEnd?.(pouredVolume);
  }, [currentVolume, onPourEnd]);

  useFrame(() => {
    if (groupRef.current && hovered && !isDragging) {
      groupRef.current.position.y += Math.sin(Date.now() * 0.005) * 0.002;
    }

    // Simulate pouring when tilted
    if (isPouring && currentVolume > 0) {
      const pourRate = 0.5; // mL per frame (slower for test tube)
      if (Math.random() < 0.3) { // Not every frame to make it realistic
        handlePourEnd(pourRate);
      }
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
