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

export const Beaker = ({
  position,
  volume = 50,
  maxVolume = 250,
  liquidColor = "#4ade80",
  isDraggable = true,
  onPourStart,
  onPourEnd,
  // Legacy props for backward compatibility
  color,
  fillLevel
}: BeakerProps) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  // Backward compatibility: use fillLevel if volume is not provided
  const normalizedFillLevel = fillLevel !== undefined ? fillLevel : currentVolume / maxVolume;

  const { materials } = usePhysics();

  // Physics body for the beaker (cylinder shape)
  const [beakerRef, beakerApi] = useCylinder(() => ({
    mass: isDraggable ? 0.5 : 0, // Lighter mass for easy dragging
    position,
    rotation: [0, 0, 0],
    material: materials.glass,
    args: [0.4, 0.35, 1, 8], // [radiusTop, radiusBottom, height, numSegments]
    type: isDraggable ? 'Dynamic' : 'Static',
  }), null);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const fillPercentage = Math.round(normalizedFillLevel * 100);
    toast.success(`Beaker selected - ${fillPercentage}% filled (${currentVolume}mL/${maxVolume}mL)`);
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
      groupRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.002;
    }

    // Simulate pouring when tilted
    if (beakerRef.current && isPouring && currentVolume > 0) {
      const pourRate = 2; // mL per frame
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
      {/* Glass Body with Physics */}
      <mesh ref={beakerRef} castShadow receiveShadow>
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
      <mesh position={[0, -0.5 + (normalizedFillLevel * 1) / 2, 0]}>
        <cylinderGeometry args={[0.35, 0.33, normalizedFillLevel * 0.95, 32]} />
        <meshStandardMaterial
          color={liquidColor || color}
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
