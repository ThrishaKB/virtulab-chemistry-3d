import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { LabTable } from "./lab/LabTable";
import { ClickableChemical } from "./lab/ClickableChemical";
import { ClickableEquipment } from "./lab/ClickableEquipment";
import { Beaker } from "./lab/Beaker";
import { Flask } from "./lab/Flask";
import { TestTube } from "./lab/TestTube";
import { BunsenBurner } from "./lab/BunsenBurner";
import { ParticleEffect } from "./lab/ParticleEffect";
import { Suspense, useState, useCallback } from "react";
import { ExperimentMaterials } from "@/config/experimentMaterials";
import { useToast } from "@/hooks/use-toast";
import { ExperimentSidebar } from "./ExperimentSidebar";

interface EnhancedLabProps {
  experimentData: ExperimentMaterials;
}

interface PlacedEquipment {
  id: string;
  type: "beaker" | "flask" | "test-tube" | "burner";
  position: [number, number, number];
  color: string;
  fillLevel: number;
  chemicalIds: string[];
}

export const EnhancedLab = ({ experimentData }: EnhancedLabProps) => {
  const { toast } = useToast();
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [addedChemicals, setAddedChemicals] = useState<string[]>([]);
  const [burnerLit, setBurnerLit] = useState(false);
  const [flameIntensity, setFlameIntensity] = useState(1);
  const [activeReaction, setActiveReaction] = useState<{
    position: [number, number, number];
    effect: string;
    color: string;
  } | null>(null);

  const isCombustionExperiment = experimentData.experimentId === "combustion";

  const handleChemicalClick = useCallback(
    (chemicalId: string) => {
      const chemical = experimentData.chemicals.find((c) => c.id === chemicalId);
      if (!chemical) return;

      // Find main beaker/container
      const mainContainer = placedEquipment.find((eq) => eq.type === "beaker" || eq.type === "flask");
      
      if (!mainContainer) {
        toast({
          title: "No Container",
          description: "Please add a beaker or flask first",
          variant: "destructive",
        });
        return;
      }

      // Special handling for combustion experiment
      if (isCombustionExperiment && burnerLit) {
        if (chemicalId === "ethanol") {
          setFlameIntensity((prev) => Math.min(prev + 0.5, 3));
          toast({
            title: "🔥 Flame Intensified!",
            description: "Ethanol acts as fuel, increasing combustion",
          });
          setActiveReaction({
            position: [0, 2, 0],
            effect: "flame",
            color: "#ff8800",
          });
          setTimeout(() => {
            setFlameIntensity((prev) => Math.max(prev - 0.3, 1));
            setActiveReaction(null);
          }, 3000);
        } else if (chemicalId === "water") {
          setFlameIntensity((prev) => Math.max(prev - 0.7, 0.2));
          toast({
            title: "💧 Flame Reduced",
            description: "Water cools and suppresses combustion",
          });
          if (flameIntensity < 0.5) {
            setBurnerLit(false);
          }
        }
      }

      // Update container
      setPlacedEquipment((prev) =>
        prev.map((eq) =>
          eq.id === mainContainer.id
            ? {
                ...eq,
                fillLevel: Math.min(eq.fillLevel + 0.2, 0.8),
                color: chemical.color,
                chemicalIds: [...eq.chemicalIds, chemicalId],
              }
            : eq
        )
      );

      setAddedChemicals((prev) => [...prev, chemicalId]);

      // Check for reactions
      const updatedChemicals = [...mainContainer.chemicalIds, chemicalId];
      checkForReaction(updatedChemicals, mainContainer.position);

      toast({
        title: `Added ${chemical.name}`,
        description: `${chemical.formula} added to container`,
      });
    },
    [experimentData, placedEquipment, toast, isCombustionExperiment, burnerLit, flameIntensity]
  );

  const handleEquipmentClick = useCallback(
    (equipmentType: string) => {
      const newPosition: [number, number, number] = [
        -1 + placedEquipment.length * 1.5,
        1.5,
        0,
      ];

      const newEquipment: PlacedEquipment = {
        id: `${equipmentType}-${Date.now()}`,
        type: equipmentType as any,
        position: newPosition,
        color: "#00ffff",
        fillLevel: 0,
        chemicalIds: [],
      };

      setPlacedEquipment((prev) => [...prev, newEquipment]);
      toast({
        title: "Equipment Added",
        description: `${equipmentType} placed on table`,
      });
    },
    [placedEquipment, toast]
  );

  const handleLightBurner = useCallback(() => {
    setBurnerLit(true);
    setFlameIntensity(1);
    toast({
      title: "🔥 Burner Lit!",
      description: "Add ethanol to increase the flame or water to extinguish it",
    });
    if (!completedSteps.includes(0)) {
      setCompletedSteps([0]);
    }
  }, [toast, completedSteps]);

  const checkForReaction = (chemicalIds: string[], position: [number, number, number]) => {
    experimentData.reactions.forEach((reaction) => {
      const hasAllReactants = reaction.reactants.every((reactant) =>
        chemicalIds.includes(reactant)
      );

      if (hasAllReactants) {
        setActiveReaction({
          position: [position[0], position[1] + 0.5, position[2]],
          effect: reaction.product.effect,
          color: reaction.product.color,
        });

        toast({
          title: "Reaction Occurring! 🧪",
          description: `Produced: ${reaction.product.name}`,
        });

        const stepIndex = experimentData.steps.findIndex((step) =>
          reaction.reactants.some((r) => step.toLowerCase().includes(r.toLowerCase()))
        );
        if (stepIndex >= 0 && !completedSteps.includes(stepIndex)) {
          setCompletedSteps((prev) => [...prev, stepIndex]);
        }

        setTimeout(() => setActiveReaction(null), 5000);
      }
    });
  };

  return (
    <div className="w-full h-screen relative flex bg-gradient-to-br from-background via-background to-primary/5">
      {/* 3D Lab View */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ position: [0, 5, 8], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={["#0f1419"]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.3} />
            <spotLight
              position={[0, 10, 0]}
              angle={0.3}
              penumbra={1}
              intensity={0.5}
              castShadow
            />

            <LabTable />

            {/* Chemicals on shelf */}
            {experimentData.chemicals.map((chemical, index) => (
              <ClickableChemical
                key={chemical.id}
                id={chemical.id}
                name={chemical.name}
                formula={chemical.formula}
                color={chemical.color}
                position={[-4, 1.5 + index * 0.7, -2]}
                onAdd={handleChemicalClick}
              />
            ))}

            {/* Available equipment on shelf */}
            {experimentData.equipment.filter(eq => eq.type !== "burner").map((equipment, index) => (
              <ClickableEquipment
                key={equipment.id}
                id={equipment.id}
                type={equipment.type as any}
                position={[4, 1.5 + index * 0.7, -2]}
                onAdd={handleEquipmentClick}
              />
            ))}

            {/* Placed equipment on table */}
            {placedEquipment.map((equipment) => {
              if (equipment.type === "beaker") {
                return (
                  <Beaker
                    key={equipment.id}
                    position={equipment.position}
                    color={equipment.color}
                    fillLevel={equipment.fillLevel}
                  />
                );
              }
              if (equipment.type === "flask") {
                return (
                  <Flask
                    key={equipment.id}
                    position={equipment.position}
                    color={equipment.color}
                    fillLevel={equipment.fillLevel}
                  />
                );
              }
              if (equipment.type === "test-tube") {
                return (
                  <TestTube
                    key={equipment.id}
                    position={equipment.position}
                    color={equipment.color}
                    fillLevel={equipment.fillLevel}
                  />
                );
              }
              return null;
            })}

            {/* Burner for combustion experiment */}
            {isCombustionExperiment && (
              <BunsenBurner
                position={[0, 1.5, 0]}
                isLit={burnerLit}
                flameIntensity={flameIntensity}
                onLight={handleLightBurner}
              />
            )}

            {/* Particle effects for reactions */}
            {activeReaction && (
              <ParticleEffect
                position={activeReaction.position}
                type={activeReaction.effect as any}
                color={activeReaction.color}
                active={true}
              />
            )}

            <Environment preset="apartment" />
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.5}
              scale={20}
              blur={1.5}
              far={10}
            />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={5}
              maxDistance={15}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Sidebar */}
      <div className="h-full border-l border-border/50">
        <ExperimentSidebar
          experimentData={experimentData}
          completedSteps={completedSteps}
          onChemicalClick={handleChemicalClick}
          onEquipmentClick={handleEquipmentClick}
          addedChemicals={addedChemicals}
        />
      </div>
    </div>
  );
};
