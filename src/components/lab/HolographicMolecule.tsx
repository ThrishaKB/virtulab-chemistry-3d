import { useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame } from "@react-three/fiber";

interface HolographicMoleculeProps {
  position: [number, number, number];
  type: "water" | "co2" | "ethanol";
}

export const HolographicMolecule = ({ position, type }: HolographicMoleculeProps) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const renderWater = () => (
    <>
      {/* Oxygen atom */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Hydrogen atoms */}
      <mesh position={[0.2, 0.15, 0]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[-0.2, 0.15, 0]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Bonds */}
      {[
        { pos: [0.1, 0.075, 0], rot: [0, 0, -0.5] },
        { pos: [-0.1, 0.075, 0], rot: [0, 0, 0.5] },
      ].map((bond, i) => (
        <mesh
          key={i}
          position={bond.pos as [number, number, number]}
          rotation={bond.rot as [number, number, number]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );

  const renderCO2 = () => (
    <>
      {/* Carbon atom */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color="#888888"
          emissive="#888888"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Oxygen atoms */}
      <mesh position={[0.3, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[-0.3, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Bonds */}
      {[
        { pos: [0.15, 0, 0], rot: [0, 0, Math.PI / 2] },
        { pos: [-0.15, 0, 0], rot: [0, 0, Math.PI / 2] },
      ].map((bond, i) => (
        <mesh
          key={i}
          position={bond.pos as [number, number, number]}
          rotation={bond.rot as [number, number, number]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial
            color="#aa00ff"
            emissive="#aa00ff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );

  const renderEthanol = () => (
    <>
      {/* Carbon atoms */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color="#888888"
          emissive="#888888"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color="#888888"
          emissive="#888888"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Oxygen atom */}
      <mesh position={[0.45, 0.15, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Hydrogen atoms */}
      {[
        [-0.15, 0.15, 0],
        [0.35, -0.15, 0],
        [0.6, 0.2, 0],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </>
  );

  return (
    <group ref={groupRef} position={position}>
      {type === "water" && renderWater()}
      {type === "co2" && renderCO2()}
      {type === "ethanol" && renderEthanol()}
      
      {/* Holographic glow effect */}
      <pointLight
        color="#00ffff"
        intensity={0.5}
        distance={2}
      />
    </group>
  );
};
