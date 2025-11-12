import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Physics, useSphere } from "@react-three/cannon";

interface FlameEffectProps {
  position: [number, number, number];
  intensity: number;
  height: number;
}

const FlameParticle = ({ 
  initialPosition, 
  color, 
  intensity 
}: { 
  initialPosition: [number, number, number];
  color: THREE.Color;
  intensity: number;
}) => {
  const [ref, api] = useSphere(() => ({
    mass: 0.001,
    position: initialPosition,
    args: [0.02],
  }));

  useFrame((state) => {
    // Apply upward force (buoyancy) with turbulence
    const turbulence = Math.sin(state.clock.elapsedTime * 10 + initialPosition[0] * 100) * 0.02;
    api.applyForce(
      [turbulence * intensity, 0.001 * intensity, turbulence * intensity * 0.5],
      [0, 0, 0]
    );

    // Reset if particle goes too high
    api.position.subscribe((p) => {
      if (p[1] > initialPosition[1] + 1.5) {
        api.position.set(
          initialPosition[0] + (Math.random() - 0.5) * 0.1,
          initialPosition[1],
          initialPosition[2] + (Math.random() - 0.5) * 0.1
        );
        api.velocity.set(0, 0, 0);
      }
    });
  });

  return (
    <mesh ref={ref as any}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export const FlameEffect = ({ position, intensity, height }: FlameEffectProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const coreFlameRef = useRef<THREE.Mesh>(null);

  // Create color gradient for flame (blue to orange to yellow)
  const flameColors = useMemo(() => {
    const colors = [];
    const particleCount = Math.floor(50 * intensity);
    
    for (let i = 0; i < particleCount; i++) {
      const ratio = i / particleCount;
      
      // Blue at base, orange in middle, yellow at top
      if (ratio < 0.3) {
        colors.push(new THREE.Color(0.2, 0.4, 1.0)); // Blue
      } else if (ratio < 0.6) {
        colors.push(new THREE.Color(1.0, 0.5, 0.0)); // Orange
      } else {
        colors.push(new THREE.Color(1.0, 0.9, 0.2)); // Yellow
      }
    }
    
    return colors;
  }, [intensity]);

  // Static particle positions for ambient glow
  const [positions, velocities] = useMemo(() => {
    const count = Math.floor(100 * intensity);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = (i / count) * Math.PI * 2;
      const radius = (Math.random() * 0.05) * intensity;
      
      pos[i3] = Math.cos(angle) * radius;
      pos[i3 + 1] = Math.random() * height;
      pos[i3 + 2] = Math.sin(angle) * radius;

      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = Math.random() * 0.03 * intensity;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return [pos, vel];
  }, [intensity, height]);

  useFrame((state, delta) => {
    // Animate static particles
    if (particlesRef.current) {
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < posArray.length; i += 3) {
        posArray[i] += velocities[i] * delta * 60;
        posArray[i + 1] += velocities[i + 1] * delta * 60;
        posArray[i + 2] += velocities[i + 2] * delta * 60;

        // Add turbulence
        const turbulence = Math.sin(state.clock.elapsedTime * 15 + i) * 0.003;
        posArray[i] += turbulence;
        posArray[i + 2] += turbulence * 0.5;

        // Reset if too high
        if (posArray[i + 1] > height * 2) {
          const angle = Math.random() * Math.PI * 2;
          const radius = (Math.random() * 0.05) * intensity;
          posArray[i] = Math.cos(angle) * radius;
          posArray[i + 1] = 0;
          posArray[i + 2] = Math.sin(angle) * radius;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate core flame
    if (coreFlameRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1 * intensity;
      coreFlameRef.current.scale.set(scale, 1 + scale * 0.5, scale);
      coreFlameRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group position={position}>
      {/* Physics-based flame particles */}
      <Physics gravity={[0, -0.5, 0]}>
        {flameColors.map((color, i) => (
          <FlameParticle
            key={i}
            initialPosition={[
              position[0] + (Math.random() - 0.5) * 0.05,
              position[1],
              position[2] + (Math.random() - 0.5) * 0.05,
            ]}
            color={color}
            intensity={intensity}
          />
        ))}
      </Physics>

      {/* Core flame cone */}
      <mesh ref={coreFlameRef} position={[0, height / 2, 0]}>
        <coneGeometry args={[0.08 * intensity, height, 8, 1, true]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ambient particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#ffaa00"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Light emission */}
      <pointLight
        position={[0, height / 2, 0]}
        intensity={intensity * 2}
        distance={3}
        color="#ff6600"
        castShadow
      />

      {/* Blue base light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={intensity * 0.5}
        distance={1}
        color="#0088ff"
      />

      {/* Heat distortion sphere */}
      <mesh position={[0, height / 2, 0]}>
        <sphereGeometry args={[0.15 * intensity, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
