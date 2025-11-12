import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { LabTable } from "./lab/LabTable";
import { DraggableChemical } from "./lab/DraggableChemical";
import { DraggableEquipment } from "./lab/DraggableEquipment";
import { ParticleEffect } from "./lab/ParticleEffect";
import { BunsenBurner } from "./lab/BunsenBurner";
import { Suspense, useState, useCallback } from "react";
import { Card } from "./ui/card";
import { ExperimentMaterials } from "@/config/experimentMaterials";
import { Vector3 } from "three";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface InteractiveLabProps {
  experimentData: ExperimentMaterials;
}

interface EquipmentState {
  id: string;
  position: Vector3;
  liquid?: {
    color: string;
    level: number;
    chemicalIds: string[];
  };
}

export const InteractiveLab = ({ experimentData }: InteractiveLabProps) => {
  const { toast } = useToast();
  const [equipmentStates, setEquipmentStates] = useState<Record<string, EquipmentState>>({});
  const [activeReaction, setActiveReaction] = useState<{
    position: [number, number, number];
    effect: string;
    color: string;
  } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [burnerLit, setBurnerLit] = useState(false);
  const [flameIntensity, setFlameIntensity] = useState(1);
  
  const isCombustionExperiment = experimentData.experimentId === "combustion";

  const handleChemicalPour = useCallback(
    (chemicalId: string, position: Vector3) => {
      const chemical = experimentData.chemicals.find((c) => c.id === chemicalId);
      if (!chemical) return;

      // Special handling for combustion experiment
      if (isCombustionExperiment && burnerLit) {
        // Check if pouring near burner (position around [0, 1.5, 0])
        const burnerPosition = new Vector3(0, 1.5, 0);
        const distanceToBurner = burnerPosition.distanceTo(position);
        
        if (distanceToBurner < 2) {
          if (chemicalId === "ethanol") {
            // Ethanol increases flame
            setFlameIntensity(prev => Math.min(prev + 0.5, 3));
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
              setFlameIntensity(prev => Math.max(prev - 0.3, 1));
              setActiveReaction(null);
            }, 3000);
            
            return;
          } else if (chemicalId === "water") {
            // Water reduces/extinguishes flame
            setFlameIntensity(prev => Math.max(prev - 0.7, 0.2));
            toast({
              title: "💧 Flame Reduced",
              description: "Water cools and suppresses combustion",
            });
            
            if (flameIntensity < 0.5) {
              setBurnerLit(false);
              toast({
                title: "Flame Extinguished",
                description: "Too much water has put out the fire",
              });
            }
            
            return;
          }
        }
      }

      // Find nearby equipment for non-combustion reactions
      const nearbyEquipment = Object.entries(equipmentStates).find(([_, state]) => {
        const distance = state.position.distanceTo(position);
        return distance < 1.5;
      });

      if (!nearbyEquipment) {
        toast({
          title: "No container nearby",
          description: "Move the chemical closer to a beaker, flask, or burner",
          variant: "destructive",
        });
        return;
      }

      const [equipmentId, equipmentState] = nearbyEquipment;

      // Update equipment with new liquid
      setEquipmentStates((prev) => {
        const newState = { ...prev };
        const currentLiquid = newState[equipmentId]?.liquid;
        
        newState[equipmentId] = {
          ...newState[equipmentId],
          liquid: {
            color: currentLiquid ? 
              // Mix colors if there's already liquid
              mixColors(currentLiquid.color, chemical.color) :
              chemical.color,
            level: Math.min((currentLiquid?.level || 0) + 0.3, 1),
            chemicalIds: [...(currentLiquid?.chemicalIds || []), chemicalId],
          },
        };

        // Check for reactions
        checkForReaction(newState[equipmentId].liquid!.chemicalIds, equipmentState.position);

        return newState;
      });

      toast({
        title: `Added ${chemical.name}`,
        description: `Poured into ${equipmentId}`,
      });
    },
    [equipmentStates, experimentData, toast, isCombustionExperiment, burnerLit, flameIntensity]
  );

  const handleLightBurner = useCallback(() => {
    setBurnerLit(true);
    setFlameIntensity(1);
    toast({
      title: "🔥 Burner Lit!",
      description: "Add ethanol to increase the flame or water to extinguish it",
    });
    
    // Mark first step as complete
    if (!completedSteps.includes(0)) {
      setCompletedSteps([0]);
    }
  }, [toast, completedSteps]);

  const checkForReaction = (chemicalIds: string[], position: Vector3) => {
    experimentData.reactions.forEach((reaction) => {
      const hasAllReactants = reaction.reactants.every((reactant) =>
        chemicalIds.includes(reactant)
      );

      if (hasAllReactants) {
        setActiveReaction({
          position: [position.x, position.y + 0.5, position.z],
          effect: reaction.product.effect,
          color: reaction.product.color,
        });

        toast({
          title: "Reaction Occurring! 🧪",
          description: `Produced: ${reaction.product.name}`,
        });

        // Mark step as completed
        const stepIndex = experimentData.steps.findIndex(step => 
          reaction.reactants.some(r => step.toLowerCase().includes(r.toLowerCase()))
        );
        if (stepIndex >= 0 && !completedSteps.includes(stepIndex)) {
          setCompletedSteps(prev => [...prev, stepIndex]);
        }

        setTimeout(() => setActiveReaction(null), 5000);
      }
    });
  };

  const handleEquipmentPlace = useCallback(
    (equipmentId: string, position: Vector3) => {
      setEquipmentStates((prev) => ({
        ...prev,
        [equipmentId]: {
          id: equipmentId,
          position: position.clone(),
          liquid: prev[equipmentId]?.liquid,
        },
      }));
    },
    []
  );

  const mixColors = (color1: string, color2: string) => {
    // Simple color mixing (in reality would need proper color space conversion)
    return color1; // For now, keep first color
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-background via-background to-primary/5">
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

          {/* Render chemicals on the side shelf */}
          {experimentData.chemicals.map((chemical, index) => (
            <DraggableChemical
              key={chemical.id}
              id={chemical.id}
              name={chemical.name}
              formula={chemical.formula}
              color={chemical.color}
              position={[-4, 1.5 + index * 0.8, -2 + index * 0.3]}
              onPour={handleChemicalPour}
            />
          ))}

          {/* Render equipment */}
          {experimentData.equipment.map((equipment, index) => {
            // For burner in combustion experiment, use BunsenBurner component
            if (equipment.type === "burner" && isCombustionExperiment) {
              return (
                <BunsenBurner
                  key={equipment.id}
                  position={[0, 1.5, 0]}
                  isLit={burnerLit}
                  flameIntensity={flameIntensity}
                  onLight={handleLightBurner}
                />
              );
            }
            
            return (
              <DraggableEquipment
                key={equipment.id}
                id={equipment.id}
                type={equipment.type}
                position={[-2 + index * 1.5, 1.5, 0]}
                onPlace={handleEquipmentPlace}
                currentLiquid={equipmentStates[equipment.id]?.liquid}
              />
            );
          })}

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

      {/* Materials Panel */}
      <Card className="absolute top-4 left-4 p-4 glass-panel holographic-border max-w-sm">
        <h2 className="text-lg font-bold text-glow-cyan mb-3">Materials Needed</h2>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1">Chemicals:</h3>
            <div className="flex flex-wrap gap-1">
              {experimentData.chemicals.map((chemical) => (
                <Badge key={chemical.id} variant="secondary" className="text-xs">
                  {chemical.formula}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1">Equipment:</h3>
            <div className="flex flex-wrap gap-1">
              {experimentData.equipment.map((equipment) => (
                <Badge key={equipment.id} variant="outline" className="text-xs">
                  {equipment.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions Panel */}
      <Card className="absolute top-4 right-4 p-4 glass-panel holographic-border max-w-md">
        <h2 className="text-lg font-bold text-glow-purple mb-3">Procedure</h2>
        <ScrollArea className="h-48">
          <ol className="space-y-2 text-sm">
            {experimentData.steps.map((step, index) => (
              <li
                key={index}
                className={`flex items-start gap-2 ${
                  completedSteps.includes(index) ? "text-green-400 line-through" : "text-foreground/80"
                }`}
              >
                <span className="font-semibold">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </Card>

      {/* Controls Help */}
      <Card className="absolute bottom-4 left-4 p-3 glass-panel border-accent/30">
        <div className="space-y-1 text-xs text-foreground/90">
          <p>🖱️ <span className="text-primary">Drag chemicals</span> to pour into containers</p>
          <p>🧪 <span className="text-primary">Drag equipment</span> to position on table</p>
          <p>🔄 <span className="text-primary">Rotate view</span> with left click + drag</p>
        </div>
      </Card>
    </div>
  );
};
