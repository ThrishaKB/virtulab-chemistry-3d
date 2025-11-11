import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { LabTable } from "./lab/LabTable";
import { Beaker } from "./lab/Beaker";
import { Flask } from "./lab/Flask";
import { TestTube } from "./lab/TestTube";
import { Bottle } from "./lab/Bottle";
import { Suspense } from "react";
import { Card } from "./ui/card";

export const ChemistryLab = () => {
  return (
    <div className="w-full h-screen relative">
      <Canvas
        shadows
        camera={{ position: [0, 5, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#e8f4f8"]} />
        
        <Suspense fallback={null}>
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

          {/* Chemistry Equipment */}
          <Beaker position={[-2, 1.5, 0]} color="#4ade80" fillLevel={0.6} />
          <Beaker position={[0, 1.5, -1]} color="#f59e0b" fillLevel={0.4} />
          <Flask position={[2, 1.5, 0]} color="#3b82f6" fillLevel={0.7} />
          <Flask position={[-1, 1.5, 1.5]} color="#ec4899" fillLevel={0.5} />
          <TestTube position={[1, 1.5, 1.5]} color="#8b5cf6" fillLevel={0.8} />
          <TestTube position={[1.5, 1.5, -1.5]} color="#14b8a6" fillLevel={0.6} />
          <Bottle position={[-2.5, 1.5, -1.5]} color="#ef4444" fillLevel={0.9} />
          <Bottle position={[2.5, 1.5, 1.5]} color="#06b6d4" fillLevel={0.7} />

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
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <Card className="absolute top-4 left-4 p-4 bg-card/90 backdrop-blur-sm border-primary/20">
        <h1 className="text-2xl font-bold text-foreground mb-2">Virtual Chemistry Lab</h1>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>🖱️ <span className="text-foreground">Left click + drag:</span> Rotate view</p>
          <p>🖱️ <span className="text-foreground">Right click + drag:</span> Pan view</p>
          <p>🖱️ <span className="text-foreground">Scroll:</span> Zoom in/out</p>
          <p>🧪 <span className="text-foreground">Click equipment:</span> Interact with items</p>
        </div>
      </Card>

      <Card className="absolute bottom-4 left-4 p-3 bg-card/90 backdrop-blur-sm border-accent/20">
        <p className="text-xs text-muted-foreground">
          <span className="text-accent font-semibold">Lab Equipment:</span> Beakers • Flasks • Test Tubes • Bottles
        </p>
      </Card>
    </div>
  );
};
