import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { InstancedMesh, Object3D } from 'three';

export interface LiquidEffectProps {
  position: Vector3;
  color: string;
  intensity: number;
  duration: number;
  type: 'pouring' | 'splash' | 'bubbling' | 'ripple';
}

export interface PouringEffectProps extends Omit<LiquidEffectProps, 'type'> {
  sourcePosition: Vector3;
  targetPosition: Vector3;
  flowRate: number;
}

export interface BubblingEffectProps extends Omit<LiquidEffectProps, 'type'> {
  containerPosition: Vector3;
  containerRadius: number;
  bubbleCount: number;
}

export interface RippleEffectProps extends Omit<LiquidEffectProps, 'type'> {
  centerPosition: Vector3;
  maxRadius: number;
  waveCount: number;
}

// Pouring stream effect component
export const PouringStream: React.FC<PouringEffectProps> = ({
  sourcePosition,
  targetPosition,
  color,
  intensity,
  duration,
  flowRate,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const time = useRef(0);

  const particles = useMemo(() => {
    const count = Math.floor(flowRate * 10); // Base particle count on flow rate
    return Array.from({ length: count }, (_, i) => ({
      offset: i / count,
      size: 0.01 + Math.random() * 0.015,
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, [flowRate]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    time.current += delta;

    particles.forEach((particle, i) => {
      const progress = (particle.offset + particle.speed * time.current) % 1;
      const position = new Vector3().lerpVectors(sourcePosition, targetPosition, progress);

      // Add slight waviness
      position.x += Math.sin(time.current * 10 + i) * 0.02;
      position.z += Math.cos(time.current * 10 + i) * 0.02;

      dummy.position.copy(position);
      dummy.scale.setScalar(particle.size * intensity);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (particles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.1}
      />
    </instancedMesh>
  );
};

// Bubbling effect component
export const BubblingEffect: React.FC<BubblingEffectProps> = ({
  containerPosition,
  containerRadius,
  color,
  intensity,
  duration,
  bubbleCount,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const time = useRef(0);

  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => ({
      x: (Math.random() - 0.5) * containerRadius * 1.5,
      z: (Math.random() - 0.5) * containerRadius * 1.5,
      size: 0.005 + Math.random() * 0.015,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [containerRadius, bubbleCount]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    time.current += delta;

    bubbles.forEach((bubble, i) => {
      const y = Math.abs(Math.sin(time.current * bubble.speed + bubble.phase)) * 0.3;
      const position = new Vector3(
        containerPosition.x + bubble.x,
        containerPosition.y + y,
        containerPosition.z + bubble.z
      );

      // Keep bubbles within container bounds
      const distanceFromCenter = Math.sqrt(bubble.x * bubble.x + bubble.z * bubble.z);
      if (distanceFromCenter > containerRadius) {
        position.x = containerPosition.x + (bubble.x / distanceFromCenter) * containerRadius * 0.9;
        position.z = containerPosition.z + (bubble.z / distanceFromCenter) * containerRadius * 0.9;
      }

      dummy.position.copy(position);
      dummy.scale.setScalar(bubble.size * intensity);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (bubbles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, bubbles.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.3}
        metalness={0.1}
      />
    </instancedMesh>
  );
};

// Ripple effect component
export const RippleEffect: React.FC<RippleEffectProps> = ({
  centerPosition,
  maxRadius,
  color,
  intensity,
  duration,
  waveCount,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const time = useRef(0);

  const waves = useMemo(() => {
    return Array.from({ length: waveCount }, (_, i) => ({
      delay: (i / waveCount) * 0.5, // Stagger wave creation
      maxRadius: maxRadius * (0.7 + Math.random() * 0.3),
      speed: 0.5 + Math.random() * 0.3,
    }));
  }, [maxRadius, waveCount]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    time.current += delta;

    waves.forEach((wave, i) => {
      const waveTime = Math.max(0, time.current - wave.delay);
      const progress = Math.min(waveTime / duration, 1);

      if (progress >= 1) return; // Wave has finished

      const radius = wave.maxRadius * progress;
      const opacity = (1 - progress) * intensity * 0.5;

      if (radius > 0 && opacity > 0) {
        dummy.position.copy(centerPosition);
        dummy.scale.set(radius, 0.01, radius);
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(i, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (waves.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, waves.length]}>
      <ringGeometry args={[0.8, 1, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        side={2} // Double side
      />
    </instancedMesh>
  );
};

// Splash effect component
export const SplashEffect: React.FC<Omit<LiquidEffectProps, 'type'> & {
  particleCount: number;
}> = ({
  position,
  color,
  intensity,
  duration,
  particleCount,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const time = useRef(0);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      direction: new Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      ).normalize(),
      speed: 1 + Math.random() * 2,
      size: 0.005 + Math.random() * 0.015,
      gravity: -9.82 * (0.5 + Math.random() * 0.5),
    }));
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    time.current += delta;

    if (time.current > duration) return;

    particles.forEach((particle, i) => {
      const t = time.current;
      const velocity = particle.direction.clone().multiplyScalar(particle.speed);
      velocity.y += particle.gravity * t;

      const particlePosition = position.clone().add(velocity.multiplyScalar(t));

      dummy.position.copy(particlePosition);
      dummy.scale.setScalar(particle.size * intensity * (1 - t / duration));
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (particles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.1}
      />
    </instancedMesh>
  );
};

// Liquid surface effect (for ripples and surface movement)
export const LiquidSurface: React.FC<{
  position: Vector3;
  radius: number;
  color: string;
  waveAmplitude: number;
  waveFrequency: number;
}> = ({ position, radius, color, waveAmplitude, waveFrequency }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    time.current += delta;

    // Create subtle surface animation
    const wave = Math.sin(time.current * waveFrequency) * waveAmplitude;
    meshRef.current.position.y = position.y + wave;
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.2}
      />
    </mesh>
  );
};

export default {
  PouringStream,
  BubblingEffect,
  RippleEffect,
  SplashEffect,
  LiquidSurface,
};