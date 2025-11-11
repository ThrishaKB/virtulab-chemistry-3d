import { useRef } from "react";
import { Mesh } from "three";

export const LabTable = () => {
  const tableRef = useRef<Mesh>(null);

  return (
    <group position={[0, 0, 0]}>
      {/* Table Top */}
      <mesh ref={tableRef} position={[0, 0.9, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 5]} />
        <meshStandardMaterial
          color="#5a4a3a"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Table Legs */}
      {[
        [-3.5, 0, -2],
        [3.5, 0, -2],
        [-3.5, 0, 2],
        [3.5, 0, 2],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
          <meshStandardMaterial
            color="#4a3a2a"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Support Beams */}
      <mesh position={[0, 0.1, -2]} receiveShadow>
        <boxGeometry args={[7, 0.1, 0.2]} />
        <meshStandardMaterial
          color="#4a3a2a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.1, 2]} receiveShadow>
        <boxGeometry args={[7, 0.1, 0.2]} />
        <meshStandardMaterial
          color="#4a3a2a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};
