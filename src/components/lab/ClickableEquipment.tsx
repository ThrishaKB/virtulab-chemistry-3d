import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Beaker } from "./Beaker";
import { Flask } from "./Flask";
import { TestTube } from "./TestTube";

interface ClickableEquipmentProps {
  id: string;
  type: "beaker" | "flask" | "test-tube";
  position: [number, number, number];
  onAdd: (equipmentId: string) => void;
}

export const ClickableEquipment = ({
  id,
  type,
  position,
  onAdd,
}: ClickableEquipmentProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.scale.setScalar(1.1 + Math.sin(Date.now() * 0.005) * 0.05);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  const renderEquipment = () => {
    switch (type) {
      case "beaker":
        return <Beaker position={[0, 0, 0]} color="#00ffff" fillLevel={0} />;
      case "flask":
        return <Flask position={[0, 0, 0]} color="#00ffff" fillLevel={0} />;
      case "test-tube":
        return <TestTube position={[0, 0, 0]} color="#00ffff" fillLevel={0} />;
      default:
        return null;
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onAdd(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {renderEquipment()}
      
      {hovered && (
        <pointLight position={[0, 0.5, 0]} intensity={0.5} distance={2} color="#00ffff" />
      )}
    </group>
  );
};
