import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleEffectProps {
  position: [number, number, number];
  type: "gas" | "flame" | "precipitate" | "smoke";
  color: string;
  active: boolean;
}

export const ParticleEffect = ({ position, type, color, active }: ParticleEffectProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, velocities] = useMemo(() => {
    const count = type === "flame" ? 200 : 100;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 0.2;
      pos[i3 + 1] = Math.random() * 0.3;
      pos[i3 + 2] = (Math.random() - 0.5) * 0.2;

      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = Math.random() * 0.02 + 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return [pos, vel];
  }, [type]);

  useFrame((state, delta) => {
    if (!particlesRef.current || !active) return;

    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < posArray.length; i += 3) {
      // Update position based on velocity
      posArray[i] += velocities[i] * delta * 60;
      posArray[i + 1] += velocities[i + 1] * delta * 60;
      posArray[i + 2] += velocities[i + 2] * delta * 60;

      // Reset particle if it goes too high or far
      if (posArray[i + 1] > 1.5 || Math.abs(posArray[i]) > 0.5) {
        posArray[i] = (Math.random() - 0.5) * 0.2;
        posArray[i + 1] = 0;
        posArray[i + 2] = (Math.random() - 0.5) * 0.2;
      }

      // Add some variation for flame effect
      if (type === "flame") {
        posArray[i] += Math.sin(state.clock.elapsedTime * 10 + i) * 0.001;
        posArray[i + 2] += Math.cos(state.clock.elapsedTime * 10 + i) * 0.001;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={type === "flame" ? 0.05 : 0.03}
        color={color}
        transparent
        opacity={type === "flame" ? 0.8 : 0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
