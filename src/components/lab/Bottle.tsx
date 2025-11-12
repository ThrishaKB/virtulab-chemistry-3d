import { useRef, useState, useCallback } from "react";
import { Group, Vector3 } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useCylinder } from "@react-three/cannon";
import { toast } from "sonner";
import { usePhysics } from "../../physics/PhysicsProvider";

interface BottleProps {
  position: [number, number, number];
  volume?: number; // Current liquid volume in mL
  maxVolume?: number; // Maximum capacity in mL
  liquidColor?: string; // Color of liquid content
  isDraggable?: boolean;
  onPourStart?: () => void;
  onPourEnd?: (pouredVolume: number) => void;
  chemicalName?: string; // Name of chemical in bottle
  concentration?: string; // Concentration of chemical
  // Legacy props for backward compatibility
  color?: string;
  fillLevel?: number;
}

export const Bottle = ({
  position,
  volume = 100,
  maxVolume = 250,
  liquidColor = "#ef4444",
  isDraggable = true,
  onPourStart,
  onPourEnd,
  chemicalName = "Reagent",
  concentration = "1M",
  // Legacy props for backward compatibility
  color,
  fillLevel
}: BottleProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [isCapOpen, setIsCapOpen] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  // Backward compatibility: use fillLevel if volume is not provided
  const normalizedFillLevel = fillLevel !== undefined ? fillLevel : currentVolume / maxVolume;

  const { materials } = usePhysics();

  // Physics body for the bottle
  const [bottleRef, bottleApi] = useCylinder(() => ({
    mass: isDraggable ? 0.4 : 0,
    position,
    material: materials.glass,
    args: [0.35, 0.35, 1.4, 8], // [radiusTop, radiusBottom, height, numSegments]
    type: isDraggable ? 'Dynamic' : 'Static',
  }), null);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const fillPercentage = Math.round(normalizedFillLevel * 100);
    toast.success(`${chemicalName} (${concentration}) - ${fillPercentage}% filled (${currentVolume}mL/${maxVolume}mL)`);
  }, [normalizedFillLevel, currentVolume, maxVolume, chemicalName, concentration]);

  const handleCapClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setIsCapOpen(!isCapOpen);
    toast.info(`Bottle cap ${isCapOpen ? 'closed' : 'opened'}`);
  }, [isCapOpen]);

  const handlePourStart = useCallback(() => {
    if (currentVolume > 0 && !isPouring && isCapOpen) {
      setIsPouring(true);
      onPourStart?.();
    } else if (!isCapOpen) {
      toast.error("Please open the bottle cap first!");
    }
  }, [currentVolume, isPouring, isCapOpen, onPourStart]);

  const handlePourEnd = useCallback((pouredVolume: number) => {
    setIsPouring(false);
    const newVolume = Math.max(0, currentVolume - pouredVolume);
    setCurrentVolume(newVolume);
    onPourEnd?.(pouredVolume);
  }, [currentVolume, onPourEnd]);

  useFrame(() => {
    if (groupRef.current && hovered && !isDragging) {
      groupRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.02);
    }

    // Simulate pouring when tilted and cap is open
    if (isPouring && currentVolume > 0 && isCapOpen) {
      const pourRate = 1; // mL per frame
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
