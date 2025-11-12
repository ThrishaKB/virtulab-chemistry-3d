'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Chemical } from '@/types'

interface BeakerProps {
  position: [number, number, number]
  scale: [number, number, number]
  capacity: number
  contents: Chemical[]
  temperature: number
  isHovered?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function Beaker({
  position,
  scale,
  capacity,
  contents,
  temperature,
  isHovered = false,
  onPointerOver,
  onPointerOut
}: BeakerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const beakerRef = useRef<THREE.Mesh>(null)
  const liquidRef = useRef<THREE.Mesh>(null)
  const [reactionProgress, setReactionProgress] = useState(0)

  // Separate liquids and solids
  const { liquids, solids } = useMemo(() => {
    const liquidChemicals = contents.filter(chemical => chemical.properties.state === 'liquid')
    const solidChemicals = contents.filter(chemical => chemical.properties.state === 'solid')
    return { liquids: liquidChemicals, solids: solidChemicals }
  }, [contents])

  // Reset reaction progress when contents change
  useEffect(() => {
    setReactionProgress(0)
  }, [contents])

  // Calculate liquid height based on liquid contents only
  const liquidHeight = useMemo(() => {
    if (!liquids.length) return 0
    // Adjust calculation for the new beaker dimensions (2.0 units tall)
    const totalHeight = liquids.length * 0.4
    return Math.min(totalHeight, 1.8)
  }, [liquids])

  // Check if displacement reaction is in progress
  const isDisplacementReaction = useMemo(() => {
    const hasZinc = solids.some(solid => solid.id === 'zn')
    const hasCuSO4 = liquids.some(liquid => liquid.id === 'cuso4')
    return hasZinc && hasCuSO4
  }, [solids, liquids])

  // Track neutralization progress for phenolphthalein
  const [neutralizationProgress, setNeutralizationProgress] = useState(0)

  // Reset neutralization progress when contents change significantly
  useEffect(() => {
    // Only reset if we don't have a pink solution or if we've lost the phenolphthalein
    // Don't reset if we're already neutralized (progress = 1)
    const hasPhenolphthalein = contents.some(c => c.id === 'phenolphthalein' && c.properties.state === 'liquid');
    const hasNaOH = contents.some(c => c.id === 'naoh' && c.properties.state === 'liquid');
    const hasPinkSolution = hasPhenolphthalein && hasNaOH;
    
    if (!hasPinkSolution && neutralizationProgress < 1) {
      setNeutralizationProgress(0);
    }
  }, [contents, neutralizationProgress])

  // Simulate neutralization progress over time when both phenolphthalein and HCl are present
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    const hasPhenolphthalein = liquids.some(c => c.id === 'phenolphthalein')
    const hasHCl = liquids.some(c => c.id === 'hcl')
    const hasNaOH = liquids.some(c => c.id === 'naoh')
    
    // Start neutralization when HCl is added to a pink solution (phenolphthalein + NaOH)
    // This can happen when HCl is added to an existing pink solution
    const hasPinkSolution = hasPhenolphthalein && hasNaOH;
    
    // Continue neutralization until complete, then stop
    if (hasPinkSolution && hasHCl && neutralizationProgress < 1) {
      intervalId = setInterval(() => {
        setNeutralizationProgress(prev => Math.min(prev + 0.01, 1))
      }, 100)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [liquids, neutralizationProgress, contents])

  // Check if precipitation reaction is in progress
  const isPrecipitationReaction = useMemo(() => {
    const hasAgNO3 = liquids.some(liquid => liquid.id === 'agno3')
    const hasNaCl = liquids.some(liquid => liquid.id === 'nacl')
    const hasAgCl = liquids.some(liquid => liquid.id === 'agcl')
    const result = hasAgNO3 && hasNaCl && !hasAgCl
    
    console.log('🧪 Precipitation check:', { hasAgNO3, hasNaCl, hasAgCl, result })
    
    return result
  }, [liquids])

  // Calculate precipitation progress
  const precipitationProgress = useMemo(() => {
    if (!isPrecipitationReaction) return 0
    return 1
  }, [isPrecipitationReaction])

  // Calculate liquid color with smooth transition for displacement reaction
  const liquidColor = useMemo(() => {
    if (liquids.length === 0) {
      console.log('🧪 Beaker EMPTY - no liquid contents')
      return '#E6F3FF'
    }

    console.log('🧪 Beaker has liquid contents:', liquids.map(c => ({ id: c.id, name: c.name })))

    const hasHCl = liquids.some(c => c.id === 'hcl')
    const hasNaOH = liquids.some(c => c.id === 'naoh')
    // Make phenolphthalein detection extremely sensitive - even trace amounts trigger the indicator
    // Phenolphthalein is a highly sensitive acid-base indicator that works at very low concentrations
    // In real labs, only 2-3 drops are needed to see a color change
    const hasPhenolphthalein = liquids.some(c => c.id === 'phenolphthalein')
    const hasAgNO3 = liquids.some(c => c.id === 'agno3')
    const hasNaCl = liquids.some(c => c.id === 'nacl')
    const hasAgCl = liquids.some(c => c.id === 'agcl')
    const hasH2O2 = liquids.some(c => c.id === 'h2o2')

    console.log('📊 Liquid contents check:', { hasHCl, hasNaOH, hasPhenolphthalein, hasAgNO3, hasNaCl, hasAgCl, hasH2O2 })

    // Special case for precipitation reaction (AgNO3 + NaCl -> AgCl + NaNO3)
    const isPrecipitationInProgress = hasAgNO3 && hasNaCl && !hasAgCl;
    if (isPrecipitationInProgress) {
      console.log('🔄 PRECIPITATION REACTION IN PROGRESS - Colorless solution with white precipitate')
      return '#F0F0F0' // Slightly off-white for cloudy appearance during precipitation
    }

    // Special case for silver chloride solution (should be colorless)
    if (hasAgCl) {
      console.log('⚪ COLORLESS - Silver chloride solution')
      return '#FFFFFF'
    }

    // Special case for hydrogen peroxide decomposition
    if (hasH2O2) {
      console.log('💧 CLEAR - Hydrogen peroxide solution becoming clearer')
      return '#F8F8FF'
    }

    if (hasPhenolphthalein) {
      // Check if we have a pink solution (phenolphthalein + NaOH)
      const hasPinkSolution = hasNaOH;
      // Check if we're in a neutralization process (pink solution with added HCl)
      // Continue neutralization even if HCl is no longer detected (fully neutralized)
      const isNeutralizing = neutralizationProgress > 0 && neutralizationProgress < 1;
      // Once neutralized, stay colorless
      const isNeutralized = neutralizationProgress >= 1;
      
      if (hasPinkSolution && !isNeutralizing && !isNeutralized) {
        console.log('🌸 LIGHT PINK - Phenolphthalein + Base')
        return '#F8A8D8' // Light pink for base condition (fainter than before)
      } else if (isNeutralizing) {
        // Gradually fade from light pink to colorless during neutralization
        const pinkColor = new THREE.Color('#F8A8D8'); // Light pink
        const colorlessColor = new THREE.Color('#FFFFFF');
        const interpolatedColor = new THREE.Color().lerpColors(
          pinkColor,
          colorlessColor,
          neutralizationProgress
        );
        console.log(`🌸→⚪ LIGHT PINK TO COLORLESS - Neutralization progress: ${neutralizationProgress.toFixed(2)}`)
        return `#${interpolatedColor.getHexString()}`;
      } else if (isNeutralized || hasHCl || (!hasNaOH && !isNeutralizing)) {
        console.log('⚪ COLORLESS - Phenolphthalein neutralized or in acid')
        return '#FFFFFF' // Pure white for neutralized or acid conditions
      }
      console.log('⚪ COLORLESS - Phenolphthalein alone (neutral)')
      return '#FFFFFF' // Pure white for neutral condition
    }

    if (hasHCl && !hasNaOH) {
      console.log('💙 PALE BLUE - HCl alone')
      return '#E8F4FD'
    }
    
    if (hasNaOH && !hasHCl) {
      console.log('💙 PALE BLUE - NaOH alone')
      return '#F0F8FF'
    }

    if (hasHCl && hasNaOH) {
      console.log('💧 CLEAR - Neutral')
      return '#E6F3FF'
    }

    // Special handling for displacement reaction with smooth color transition
    if (isDisplacementReaction) {
      const blueColor = new THREE.Color('#4169E1')
      const colorlessColor = new THREE.Color('#F5F5F5')
      const interpolatedColor = new THREE.Color().lerpColors(
        blueColor,
        colorlessColor,
        reactionProgress
      )
      console.log(`🔄 Displacement reaction progress: ${reactionProgress.toFixed(2)}`)
      return `#${interpolatedColor.getHexString()}`
    }

    if (liquids.length === 1) {
      return liquids[0].color || '#E6F3FF'
    }

    let r = 0, g = 0, b = 0
    liquids.forEach(chemical => {
      const color = new THREE.Color(chemical.color || '#FFFFFF')
      r += color.r
      g += color.g
      b += color.b
    })
    
    const avgColor = new THREE.Color(
      r / liquids.length,
      g / liquids.length,
      b / liquids.length
    )
    
    return `#${avgColor.getHexString()}`
  }, [liquids, isDisplacementReaction, reactionProgress, precipitationProgress, neutralizationProgress])

  // Simulate reaction progress over time when displacement reaction is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (isDisplacementReaction && reactionProgress < 1) {
      intervalId = setInterval(() => {
        setReactionProgress(prev => Math.min(prev + 0.008, 1))
      }, 200)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isDisplacementReaction, reactionProgress])

  useFrame((state) => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.05 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      
      if (beakerRef.current) {
        beakerRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      }
    }

    if (liquidRef.current && liquidHeight > 0) {
      const time = state.clock.elapsedTime
      liquidRef.current.position.y = -1.0 + liquidHeight / 2 + Math.sin(time * 2) * 0.015
      
      if (liquidRef.current.material && 'color' in liquidRef.current.material) {
        (liquidRef.current.material as any).color.set(liquidColor)
      }
    }
  })

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Main Beaker Body - Taller and slimmer cylindrical shape */}
      <mesh
        ref={beakerRef}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.7, 0.8, 2.0, 32]} />
        <meshPhysicalMaterial
          color="#e2e8f0" // Frosted glass color
          transparent
          opacity={0.45} // Slightly translucent for frosted glass effect
          roughness={0.25} // Higher roughness for frosted appearance
          metalness={0.05} // Low metalness for glass-like appearance
          transmission={0.7} // Reduced transmission for frosted glass
          thickness={0.15} // Increased thickness for more realistic glass
          ior={1.52}
          clearcoat={0.3} // Enhanced clearcoat for soft light reflection
          clearcoatRoughness={0.2}
          envMapIntensity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Beaker Base - Flat circular base */}
      <mesh
        position={[0, -1.0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.75, 0.75, 0.1, 32]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          transparent
          opacity={0.45}
          roughness={0.25}
          metalness={0.05}
          transmission={0.7}
          thickness={0.15}
          ior={1.52}
        />
      </mesh>

      {/* Measurement Markings - Properly aligned on the side */}
      {Array.from({ length: 12 }).map((_, index) => (
        <mesh
          key={`marking-${index}`}
          position={[0.7, -0.8 + index * 0.15, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.005, 0.005, index % 4 === 0 ? 0.1 : 0.06]} />
          <meshStandardMaterial 
            color={index % 4 === 0 ? "#2d3748" : "#4a5568"} 
            roughness={0.4} 
          />
        </mesh>
      ))}

      {/* Liquid Content */}
      {liquids.length > 0 && liquidHeight > 0 && (
        <mesh
          ref={liquidRef}
          position={[0, -1.0 + liquidHeight / 2, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.65, 0.65, liquidHeight, 32]} />
          <meshPhysicalMaterial
            color={liquidColor}
            transparent
            opacity={isPrecipitationReaction ? 0.8 : 0.85} // Slightly less opaque during precipitation
            roughness={isPrecipitationReaction ? 0.35 : 0.1} // Higher roughness for cloudy appearance during precipitation
            metalness={0.01}
            clearcoat={0.4}
            clearcoatRoughness={isPrecipitationReaction ? 0.45 : 0.15} // Higher roughness during precipitation
            transmission={isPrecipitationReaction ? 0.4 : 0.6} // Lower transmission for cloudy appearance
            ior={1.33}
            depthWrite={true}
            side={THREE.FrontSide}
            envMapIntensity={0.15}
          />
        </mesh>
      )}

      {/* White cloudy AgCl precipitate layer at the bottom with floating streaks */}
      {(liquids.some(liquid => liquid.id === 'agcl') || isPrecipitationReaction) && (
        <group position={[0, -1.0, 0]}>
          {/* Dense white layer at the bottom representing settled AgCl precipitate */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 0.15, 32]} />
            <meshPhysicalMaterial
              color="#F8F8F8" // Off-white for AgCl precipitate
              roughness={0.6} // Higher roughness for cloudy appearance
              metalness={0.0} // No metalness for non-metallic appearance
              transparent={true} // Semi-transparent for realistic precipitate
              opacity={0.95} // More opaque for dense precipitate appearance
              transmission={0.1} // Very low transmission for cloudy appearance
              clearcoat={0.1} // Subtle clearcoat
              clearcoatRoughness={0.4}
              envMapIntensity={0.05}
              ior={1.33}
            />
          </mesh>
          
          {/* Floating cloudy streaks during precipitation formation */}
          {isPrecipitationReaction && Array.from({ length: 15 }).map((_, index) => (
            <mesh
              key={`streak-${index}`}
              position={[
                (Math.random() - 0.5) * 0.5,
                0.1 + Math.random() * (liquidHeight * 0.8),
                (Math.random() - 0.5) * 0.5
              ]}
            >
              <sphereGeometry args={[0.02 + Math.random() * 0.05]} />
              <meshPhysicalMaterial
                color="#F8F8F8" // Off-white for AgCl precipitate
                roughness={0.7} // Higher roughness for cloudy appearance
                metalness={0.0} // No metalness
                transparent={true}
                opacity={0.8} // More opaque for visible streaks
                transmission={0.2}
                clearcoat={0.05}
                clearcoatRoughness={0.5}
                envMapIntensity={0.02}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Solid Content (Zinc pieces with copper coating) */}
      {solids.map((solid, index) => (
        <group key={solid.id} position={[0, -0.9 + (index * 0.05), 0]}>
          {Array.from({ length: 12 }).map((_, pieceIndex) => {
            const copperCoatingIntensity = isDisplacementReaction ? reactionProgress : 0;
            const baseColor = new THREE.Color(solid.color);
            const copperColor = new THREE.Color('#A0522D');
            const finalColor = new THREE.Color().lerpColors(baseColor, copperColor, copperCoatingIntensity);
            
            return (
              <mesh
                key={pieceIndex}
                position={[
                  (Math.random() - 0.5) * 0.5,
                  (Math.random() - 0.5) * 0.1,
                  (Math.random() - 0.5) * 0.5
                ]}
                rotation={[
                  Math.random() * Math.PI,
                  Math.random() * Math.PI,
                  Math.random() * Math.PI
                ]}
              >
                <boxGeometry args={[
                  0.05 + Math.random() * 0.03,
                  0.01 + Math.random() * 0.015,
                  0.015 + Math.random() * 0.02
                ]} />
                <meshStandardMaterial
                  color={finalColor}
                  roughness={0.25 - copperCoatingIntensity * 0.1}
                  metalness={0.8 + copperCoatingIntensity * 0.2}
                  emissive={new THREE.Color(
                    0.5 + copperCoatingIntensity * 0.3,
                    0.5 + copperCoatingIntensity * 0.2,
                    0.5 + copperCoatingIntensity * 0.1
                  )}
                  emissiveIntensity={0.1 + copperCoatingIntensity * 0.15}
                />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Copper deposits that form during reaction */}
      {solids.some(solid => solid.id === 'zn') && liquids.some(liquid => liquid.id === 'cuso4') && (
        <group position={[0, -0.9, 0]}>
          {Array.from({ length: Math.floor(30 * reactionProgress) }).map((_, depositIndex) => (
            <mesh
              key={`cu-${depositIndex}`}
              position={[
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.6
              ]}
              rotation={[
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
              ]}
            >
              <boxGeometry args={[
                0.01 + Math.random() * 0.015,
                0.003 + Math.random() * 0.008,
                0.008 + Math.random() * 0.012
              ]} />
              <meshStandardMaterial
                color="#A0522D"
                roughness={0.3}
                metalness={0.8}
                emissive={new THREE.Color('#A0522D')}
                emissiveIntensity={0.15}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Catalyst visualization for H2O2 decomposition */}
      {liquids.some(liquid => liquid.id === 'h2o2') && (
        <group position={[0, -0.9, 0]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <mesh
              key={`catalyst-${index}`}
              position={[
                (Math.random() - 0.5) * 0.3,
                0,
                (Math.random() - 0.5) * 0.3
              ]}
            >
              <sphereGeometry args={[0.02 + Math.random() * 0.015]} />
              <meshStandardMaterial
                color="#4a5568"
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Condensation effect on beaker walls during exothermic reactions */}
      {liquids.some(liquid => liquid.id === 'h2o2') && (
        <group>
          {Array.from({ length: 15 }).map((_, index) => (
            <mesh
              key={`condensation-${index}`}
              position={[
                0.7 * Math.cos((index * 0.5) * Math.PI),
                -0.8 + Math.random() * 1.5,
                0.7 * Math.sin((index * 0.5) * Math.PI)
              ]}
            >
              <sphereGeometry args={[0.01 + Math.random() * 0.008]} />
              <meshStandardMaterial
                color="#e0f0ff"
                roughness={0.1}
                metalness={0.05}
                transparent={true}
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Steam effect near the beaker rim during exothermic reactions */}
      {liquids.some(liquid => liquid.id === 'h2o2') && (
        <group position={[0, 1.0, 0]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <mesh
              key={`steam-${index}`}
              position={[
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.15,
                (Math.random() - 0.5) * 0.2
              ]}
            >
              <sphereGeometry args={[0.015 + Math.random() * 0.015]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.3}
                metalness={0.0}
                transparent={true}
                opacity={0.4}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}