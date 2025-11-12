import React, { useRef, useMemo } from 'react';
import { Physics } from '@react-three/cannon';
import { Vector3 } from 'three';

// Physics material properties for different interaction types
export const physicsMaterials = {
  glass: { friction: 0.1, restitution: 0.3 }, // Glass equipment
  liquid: { friction: 0.05, restitution: 0.1 }, // Liquid physics
  metal: { friction: 0.4, restitution: 0.2 }, // Metal tools
  table: { friction: 0.8, restitution: 0.1 }, // Lab table surface
  plastic: { friction: 0.3, restitution: 0.2 }, // Plastic equipment
};

export interface PhysicsContextType {
  materials: typeof physicsMaterials;
  groundPosition: Vector3;
  groundSize: Vector3;
}

export const PhysicsContext = React.createContext<PhysicsContextType | null>(null);

export const usePhysics = () => {
  const context = React.useContext(PhysicsContext);
  if (!context) {
    throw new Error('usePhysics must be used within a PhysicsProvider');
  }
  return context;
};

interface PhysicsProviderProps {
  children: React.ReactNode;
  gravity?: [number, number, number];
  groundPosition?: [number, number, number];
  groundSize?: [number, number, number];
  enabled?: boolean;
}

export const PhysicsProvider: React.FC<PhysicsProviderProps> = ({
  children,
  gravity = [0, -9.82, 0],
  groundPosition = [0, 0, 0],
  groundSize = [20, 1, 20],
  enabled = true,
}) => {
  const groundRef = useRef();

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    materials: physicsMaterials,
    groundPosition: new Vector3(...groundPosition),
    groundSize: new Vector3(...groundSize),
  }), [groundPosition, groundSize]);

  if (!enabled) {
    return (
      <PhysicsContext.Provider value={contextValue}>
        {children}
      </PhysicsContext.Provider>
    );
  }

  return (
    <PhysicsContext.Provider value={contextValue}>
      <Physics
        gravity={gravity}
        allowSleep={true}
        broadphase="SAP"
        defaultContactMaterial={{
          friction: 0.4,
          restitution: 0.3,
        }}
      >
        {/* Invisible ground plane for physics collisions */}
        <group ref={groundRef}>
          {/* This will be handled by the LabTable component which has a visible ground */}
        </group>

        {children}
      </Physics>
    </PhysicsContext.Provider>
  );
};

export default PhysicsProvider;