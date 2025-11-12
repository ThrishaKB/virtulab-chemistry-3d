import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Vector3, Object3D, MathUtils } from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysics } from './PhysicsProvider';

export interface LiquidParticle {
  id: string;
  position: Vector3;
  velocity: Vector3;
  color: string;
  size: number;
  lifetime: number;
  age: number;
  isPouring: boolean;
}

export interface LiquidStream {
  id: string;
  sourcePosition: Vector3;
  targetPosition: Vector3;
  particles: LiquidParticle[];
  isActive: boolean;
  flowRate: number; // mL per second
  color: string;
}

export interface PourData {
  sourceContainer: Object3D;
  targetContainer: Object3D;
  sourceVolume: number;
  targetVolume: number;
  transferRate: number;
  liquidColor: string;
}

export interface LiquidSystemContextType {
  streams: LiquidStream[];
  startPour: (data: PourData) => void;
  stopPour: (streamId: string) => void;
  createSplash: (position: Vector3, color: string, count: number) => void;
  clearAllStreams: () => void;
}

export const LiquidSystemContext = React.createContext<LiquidSystemContextType | null>(null);

export const useLiquidSystem = () => {
  const context = React.useContext(LiquidSystemContext);
  if (!context) {
    throw new Error('useLiquidSystem must be used within a LiquidSystemProvider');
  }
  return context;
};

interface LiquidSystemProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  maxParticles?: number;
  gravity?: Vector3;
}

export const LiquidSystemProvider: React.FC<LiquidSystemProviderProps> = ({
  children,
  enabled = true,
  maxParticles = 500,
  gravity = new Vector3(0, -9.82, 0),
}) => {
  const [streams, setStreams] = useState<LiquidStream[]>([]);
  const [splashParticles, setSplashParticles] = useState<LiquidParticle[]>([]);
  const particleIdCounter = useRef(0);
  const streamIdCounter = useRef(0);

  const createParticle = useCallback((
    position: Vector3,
    velocity: Vector3,
    color: string,
    size: number = 0.02,
    lifetime: number = 2.0
  ): LiquidParticle => {
    return {
      id: `particle-${particleIdCounter.current++}`,
      position: position.clone(),
      velocity: velocity.clone(),
      color,
      size,
      lifetime,
      age: 0,
      isPouring: true,
    };
  }, []);

  const createStreamParticle = useCallback((
    stream: LiquidStream,
    progress: number
  ): LiquidParticle => {
    // Calculate position along the stream path
    const streamPosition = new Vector3().lerpVectors(
      stream.sourcePosition,
      stream.targetPosition,
      progress
    );

    // Add some randomness for natural look
    const randomOffset = new Vector3(
      (Math.random() - 0.5) * 0.02,
      0,
      (Math.random() - 0.5) * 0.02
    );

    streamPosition.add(randomOffset);

    // Calculate velocity based on stream direction and gravity
    const direction = new Vector3().subVectors(stream.targetPosition, stream.sourcePosition).normalize();
    const velocity = direction.multiplyScalar(2 + Math.random() * 0.5);
    velocity.add(gravity.clone().multiplyScalar(0.1));

    return createParticle(
      streamPosition,
      velocity,
      stream.color,
      0.015 + Math.random() * 0.01,
      1.5 + Math.random() * 0.5
    );
  }, [createParticle, gravity]);

  const startPour = useCallback((data: PourData) => {
    const streamId = `stream-${streamIdCounter.current++}`;

    // Calculate pour positions based on container geometries
    const sourcePosition = data.sourceContainer.position.clone();
    const targetPosition = data.targetContainer.position.clone();

    // Adjust source position to pour spout
    sourcePosition.y += 0.2; // Approximate pour spout height

    // Adjust target position to container opening
    targetPosition.y += 0.1; // Approximate container opening height

    const newStream: LiquidStream = {
      id: streamId,
      sourcePosition,
      targetPosition,
      particles: [],
      isActive: true,
      flowRate: data.transferRate,
      color: data.liquidColor,
    };

    setStreams(prev => [...prev, newStream]);

    console.log(`Started pouring from ${data.sourceContainer.userData?.id || 'unknown'} to ${data.targetContainer.userData?.id || 'unknown'}`);
  }, []);

  const stopPour = useCallback((streamId: string) => {
    setStreams(prev => prev.map(stream =>
      stream.id === streamId ? { ...stream, isActive: false } : stream
    ));

    // Remove stream after all particles have died
    setTimeout(() => {
      setStreams(prev => prev.filter(stream => stream.id !== streamId));
    }, 3000);

    console.log(`Stopped pouring stream: ${streamId}`);
  }, []);

  const createSplash = useCallback((position: Vector3, color: string, count: number = 10) => {
    const newParticles: LiquidParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = new Vector3(
        Math.cos(angle) * (0.5 + Math.random() * 0.5),
        1 + Math.random() * 0.5,
        Math.sin(angle) * (0.5 + Math.random() * 0.5)
      );

      newParticles.push(createParticle(
        position.clone(),
        velocity,
        color,
        0.01 + Math.random() * 0.02,
        0.5 + Math.random() * 0.5
      ));
    }

    setSplashParticles(prev => [...prev, ...newParticles]);
  }, [createParticle]);

  const clearAllStreams = useCallback(() => {
    setStreams([]);
    setSplashParticles([]);
  }, []);

  // Update particles physics
  useFrame((state, delta) => {
    if (!enabled) return;

    setStreams(prev => prev.map(stream => {
      if (!stream.isActive && stream.particles.length === 0) {
        return stream;
      }

      // Add new particles if stream is active
      let updatedParticles = [...stream.particles];

      if (stream.isActive && updatedParticles.length < maxParticles / 10) {
        const particlesToAdd = Math.floor(stream.flowRate * delta * 5); // Convert flow rate to particle count

        for (let i = 0; i < particlesToAdd; i++) {
          const progress = Math.random(); // Random position along stream
          updatedParticles.push(createStreamParticle(stream, progress));
        }
      }

      // Update existing particles
      updatedParticles = updatedParticles
        .map(particle => {
          const newPosition = particle.position.clone();
          const newVelocity = particle.velocity.clone();

          // Apply gravity
          newVelocity.add(gravity.clone().multiplyScalar(delta));

          // Update position
          newPosition.add(newVelocity.clone().multiplyScalar(delta));

          // Check if particle reached target area
          const distanceToTarget = newPosition.distanceTo(stream.targetPosition);
          if (distanceToTarget < 0.1) {
            // Create splash effect
            if (Math.random() < 0.3) { // Not every particle creates splash
              createSplash(newPosition, stream.color, 3);
            }
            return null; // Remove particle
          }

          // Update particle age
          const newAge = particle.age + delta;
          if (newAge > particle.lifetime) {
            return null; // Remove old particle
          }

          return {
            ...particle,
            position: newPosition,
            velocity: newVelocity,
            age: newAge,
          };
        })
        .filter((p): p is LiquidParticle => p !== null);

      return {
        ...stream,
        particles: updatedParticles,
      };
    }));

    // Update splash particles
    setSplashParticles(prev => prev
      .map(particle => {
        const newPosition = particle.position.clone();
        const newVelocity = particle.velocity.clone();

        // Apply gravity with stronger effect for splash
        newVelocity.add(gravity.clone().multiplyScalar(delta * 1.5));

        // Apply some damping
        newVelocity.multiplyScalar(0.98);

        // Update position
        newPosition.add(newVelocity.clone().multiplyScalar(delta));

        // Check if particle hit the ground (y < 0)
        if (newPosition.y < 0) {
          newPosition.y = 0;
          newVelocity.y = 0;
          newVelocity.multiplyScalar(0.5); // More damping on ground contact
        }

        // Update particle age
        const newAge = particle.age + delta;
        if (newAge > particle.lifetime) {
          return null; // Remove old particle
        }

        return {
          ...particle,
          position: newPosition,
          velocity: newVelocity,
          age: newAge,
        };
      })
      .filter((p): p is LiquidParticle => p !== null)
    );
  });

  const contextValue: LiquidSystemContextType = {
    streams,
    startPour,
    stopPour,
    createSplash,
    clearAllStreams,
  };

  return (
    <LiquidSystemContext.Provider value={contextValue}>
      {children}

      {/* Render liquid particles */}
      {streams.map(stream => (
        <React.Fragment key={stream.id}>
          {stream.particles.map(particle => (
            <mesh key={particle.id} position={particle.position}>
              <sphereGeometry args={[particle.size, 6, 6]} />
              <meshStandardMaterial
                color={particle.color}
                transparent
                opacity={0.8 * (1 - particle.age / particle.lifetime)}
                roughness={0.2}
                metalness={0.1}
              />
            </mesh>
          ))}
        </React.Fragment>
      ))}

      {/* Render splash particles */}
      {splashParticles.map(particle => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[particle.size, 6, 6]} />
          <meshStandardMaterial
            color={particle.color}
            transparent
            opacity={0.7 * (1 - particle.age / particle.lifetime)}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}
    </LiquidSystemContext.Provider>
  );
};

export default LiquidSystemProvider;