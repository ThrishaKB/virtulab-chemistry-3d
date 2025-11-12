import { useRef, useState, useCallback } from "react";
import { Group, Vector3 } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useCone, useCylinder } from "@react-three/cannon";
import { toast } from "sonner";
import { usePhysics } from "../../physics/PhysicsProvider";

interface FlaskProps {
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

export const Flask = ({
  position,
  volume = 100,
  maxVolume = 500,
  liquidColor = "#3b82f6",
  isDraggable = true,
  onPourStart,
  onPourEnd,
  // Legacy props for backward compatibility
  color,
  fillLevel
}: FlaskProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  // Backward compatibility: use fillLevel if volume is not provided
  const normalizedFillLevel = fillLevel !== undefined ? fillLevel : currentVolume / maxVolume;

  const { materials } = usePhysics();

  // Physics body for the flask body (cone shape)
  const [flaskBodyRef, flaskBodyApi] = useCone(() => ({
    mass: isDraggable ? 0.6 : 0, // Slightly heavier than beaker
    position: [position[0], position[1] - 0.6, position[2]], // Adjust for cone center
    rotation: [Math.PI, 0, 0], // Flip cone to point up
    material: materials.glass,
    args: [0.5, 1.2, 8], // [radius, height, numSegments]
    type: isDraggable ? 'Dynamic' : 'Static',
  }), null);

  // Physics body for the flask neck (cylinder shape)
  const [flaskNeckRef, flaskNeckApi] = useCylinder(() => ({
    mass: isDraggable ? 0.1 : 0,
    position: [position[0], position[1] + 0.8, position[2]],
    material: materials.glass,
    args: [0.15, 0.15, 0.6, 8], // [radiusTop, radiusBottom, height, numSegments]
    type: isDraggable ? 'Dynamic' : 'Static',
  }), null);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const fillPercentage = Math.round(normalizedFillLevel * 100);
    toast.success(`Erlenmeyer Flask - ${fillPercentage}% filled (${currentVolume}mL/${maxVolume}mL)`);
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
      groupRef.current.rotation.y += 0.01;
    }

    // Simulate pouring when tilted
    if (isPouring && currentVolume > 0) {
      const pourRate = 1.5; // mL per frame
      if (Math.random() < 0.3) { // Not every frame to make it realistic
        handlePourEnd(pourRate);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (isDraggable) {
          setIsDragging(true);
        }
      }}
      onPointerUp={() => setIsDragging(false)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
      onDoubleClick={() => handlePourStart()}
    >
      {/* Flask Body (Conical) with Physics */}
      <mesh ref={flaskBodyRef} castShadow receiveShadow>
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

      {/* Flask Neck with Physics */}
      <mesh ref={flaskNeckRef} castShadow receiveShadow>
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
      <mesh position={[0, -0.6 + (normalizedFillLevel * 1.2) / 2, 0]}>
        <coneGeometry args={[0.48 * normalizedFillLevel, normalizedFillLevel * 1.15, 32]} />
        <meshStandardMaterial
          color={liquidColor || color}
          transparent
          opacity={0.7}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Pouring indicator */}
      {isPouring && currentVolume > 0 && (
        <mesh position={[0.1, 1.2, 0]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial
            color={liquidColor || color}
            transparent
            opacity={0.8}
            emissive={liquidColor || color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};
