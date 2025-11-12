import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { LabTable } from "./lab/LabTable";
import { Beaker } from "./lab/Beaker";
import { Flask } from "./lab/Flask";
import { TestTube } from "./lab/TestTube";
import { Bottle } from "./lab/Bottle";
import { HolographicMolecule } from "./lab/HolographicMolecule";
import { FloatingScreen } from "./lab/FloatingScreen";
import { PhysicsProvider } from "../physics/PhysicsProvider";
import { DragDropProvider } from "../interactions/DragDropManager";
import { InteractiveObject } from "../interactions/InteractiveObject";
import { Suspense } from "react";
import { Card } from "./ui/card";

export const ChemistryLab = () => {
  const handleEquipmentClick = (type: string, name: string) => {
    console.log(`Clicked on ${type}: ${name}`);
  };

  const handleEquipmentDoubleClick = (type: string, name: string) => {
    console.log(`Double clicked on ${type}: ${name} - Starting pour simulation`);
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
          <PhysicsProvider>
            <DragDropProvider>
              {/* Lighting */}
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

              {/* Lab Table */}
              <LabTable />

              {/* Chemistry Equipment with Physics and Drag/Drop */}
              <InteractiveObject
                id="beaker-1"
                type="equipment"
                onClick={() => handleEquipmentClick('equipment', 'Green Beaker')}
                onDoubleClick={() => handleEquipmentDoubleClick('equipment', 'Green Beaker')}
              >
                <Beaker position={[-2, 1.5, 0]} volume={150} liquidColor="#4ade80" />
              </InteractiveObject>

              <InteractiveObject
                id="beaker-2"
                type="equipment"
                onClick={() => handleEquipmentClick('equipment', 'Orange Beaker')}
                onDoubleClick={() => handleEquipmentDoubleClick('equipment', 'Orange Beaker')}
              >
                <Beaker position={[0, 1.5, -1]} volume={100} liquidColor="#f59e0b" />
              </InteractiveObject>

              <InteractiveObject
                id="flask-1"
                type="equipment"
                onClick={() => handleEquipmentClick('equipment', 'Blue Flask')}
                onDoubleClick={() => handleEquipmentDoubleClick('equipment', 'Blue Flask')}
              >
                <Flask position={[2, 1.5, 0]} volume={350} liquidColor="#3b82f6" />
              </InteractiveObject>

              <InteractiveObject
                id="flask-2"
                type="equipment"
                onClick={() => handleEquipmentClick('equipment', 'Pink Flask')}
                onDoubleClick={() => handleEquipmentDoubleClick('equipment', 'Pink Flask')}
              >
                <Flask position={[-1, 1.5, 1.5]} volume={250} liquidColor="#ec4899" />
              </InteractiveObject>

              <InteractiveObject
                id="testtube-1"
                type="equipment"
                onClick={() => handleEquipmentClick('equipment', 'Purple Test Tube')}
                onDoubleClick={() => handleEquipmentDoubleClick('equipment', 'Purple Test Tube')}
              >
                <TestTube position={[1, 1.5, 1.5]} volume={40} liquidColor="#8b5cf6" />
              </InteractiveObject>

              <InteractiveObject
                id="testtube-2"
                type="equipment"
                onClick={() => handleEquipmentClick('equipment', 'Teal Test Tube')}
                onDoubleClick={() => handleEquipmentDoubleClick('equipment', 'Teal Test Tube')}
              >
                <TestTube position={[1.5, 1.5, -1.5]} volume={30} liquidColor="#14b8a6" />
              </InteractiveObject>

              <InteractiveObject
                id="bottle-1"
                type="chemical"
                onClick={() => handleEquipmentClick('chemical', 'HCl Bottle')}
                onDoubleClick={() => handleEquipmentDoubleClick('chemical', 'HCl Bottle')}
              >
                <Bottle
                  position={[-2.5, 1.5, -1.5]}
                  volume={225}
                  liquidColor="#ef4444"
                  chemicalName="HCl"
                  concentration="1M"
                />
              </InteractiveObject>

              <InteractiveObject
                id="bottle-2"
                type="chemical"
                onClick={() => handleEquipmentClick('chemical', 'NaOH Bottle')}
                onDoubleClick={() => handleEquipmentDoubleClick('chemical', 'NaOH Bottle')}
              >
                <Bottle
                  position={[2.5, 1.5, 1.5]}
                  volume={175}
                  liquidColor="#06b6d4"
                  chemicalName="NaOH"
                  concentration="1M"
                />
              </InteractiveObject>

              {/* Holographic Molecules */}
              <HolographicMolecule position={[-3, 3, 0]} type="water" />
              <HolographicMolecule position={[3, 3.5, 0]} type="co2" />
              <HolographicMolecule position={[0, 3.2, 2]} type="ethanol" />

              {/* Floating Information Screens */}
              <FloatingScreen
                position={[-3.5, 2.5, -2]}
                text="H₂O\nWater Molecule"
                color="#00ffff"
              />
              <FloatingScreen
                position={[3.5, 2.8, -2]}
                text="CO₂\nCarbon Dioxide"
                color="#aa00ff"
              />
              <FloatingScreen
                position={[0, 2.6, -2.5]}
                text="C₂H₅OH\nEthanol"
                color="#ff00ff"
              />

              {/* Environment and Controls */}
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
            </DragDropProvider>
          </PhysicsProvider>
        </Suspense>
      </Canvas>

      {/* UI Overlay with futuristic styling */}
      <Card className="absolute top-4 left-4 p-4 glass-panel holographic-border">
        <h1 className="text-2xl font-bold text-glow-cyan mb-2">Virtual Chemistry Lab</h1>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>🖱️ <span className="text-primary">Left click + drag:</span> Rotate view</p>
          <p>🖱️ <span className="text-primary">Right click + drag:</span> Pan view</p>
          <p>🖱️ <span className="text-primary">Scroll:</span> Zoom in/out</p>
          <p>🧪 <span className="text-primary">Click equipment:</span> Interact with items</p>
        </div>
      </Card>

      <Card className="absolute bottom-4 left-4 p-3 glass-panel border-accent/30 glow-purple">
        <p className="text-xs text-foreground/90">
          <span className="text-accent font-semibold text-glow-purple">Lab Equipment:</span> Beakers • Flasks • Test Tubes • Bottles
        </p>
      </Card>
    </div>
  );
};
