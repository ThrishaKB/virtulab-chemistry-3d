'use client'

import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Experiment, Chemical } from '@/types'
import { generateReactionLogic, checkReactionTrigger } from '@/data/reactionLogic'
import InteractiveEquipment from './InteractiveEquipment'
import Beaker from './equipment/Beaker'
import Flask from './equipment/Flask'
import TestTube from './equipment/TestTube'
import BunsenBurner from './equipment/BunsenBurner'
import GraduatedCylinder from './equipment/GraduatedCylinder'
import Burette from './equipment/Burette'
import StirringRod from './equipment/StirringRod'
import Thermometer from './equipment/Thermometer'
import PouringEffect from './effects/PouringEffect'

interface LabEquipmentProps {
  experiment: Experiment
  onStepComplete?: (stepIndex: number, chemical: Chemical) => void
  onChemicalAdd?: (chemical: Chemical) => void
  onReactionTrigger?: (reactionType: string, position: [number, number, number], intensity: number) => void
}

const LabEquipment = forwardRef<any, LabEquipmentProps>(function LabEquipment({ experiment, onStepComplete, onChemicalAdd, onReactionTrigger }, ref) {
  const groupRef = useRef<THREE.Group>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [pouringState, setPouringState] = useState<{ from: string; to: string } | null>(null)
  const [equipmentContents, setEquipmentContents] = useState<{ [key: string]: Chemical[] }>({})
  const [activePouring, setActivePouring] = useState<{
    fromPosition: THREE.Vector3
    toPosition: THREE.Vector3
    chemical: Chemical
    active: boolean
  } | null>(null)
  
  const addedChemicalsRef = useRef<Set<string>>(new Set())
  const processingRef = useRef(false)
  const reactionLogicRef = useRef(generateReactionLogic([experiment]))

  const equipmentLayout = getEquipmentLayout(experiment)
  
  // Reset when experiment changes
  useEffect(() => {
    console.log('🔄 Resetting equipment for experiment:', experiment.id)
    setEquipmentContents({})
    addedChemicalsRef.current.clear()
    reactionLogicRef.current = generateReactionLogic([experiment])
  }, [experiment.id])

  const handlePour = (fromId: string, toId: string) => {
    setPouringState({ from: fromId, to: toId })
    
    console.log(`Pouring from ${fromId} to ${toId}`)
    
    setTimeout(() => {
      setPouringState(null)
    }, 3000)
  }

  const handleChemicalPour = (chemical: Chemical) => {
    // Don't block if already processing - allow retry
    if (processingRef.current) {
      console.log('Already processing, please wait...')
      setTimeout(() => {
        processingRef.current = false
      }, 500)
      return
    }
    
    processingRef.current = true
    console.log(`➕ Adding ${chemical.name}`)
    
    const mainBeaker = equipmentLayout.find(item => item.type === 'beaker')
    
    if (!mainBeaker) {
      console.warn('❌ No beaker found')
      processingRef.current = false
      return
    }

    const currentContents = equipmentContents[mainBeaker.id] || []
    const alreadyExists = currentContents.some(c => c.id === chemical.id)
    
    if (alreadyExists) {
      console.log(`⚠️ ${chemical.name} already in beaker`)
      processingRef.current = false
      return
    }

    // Add to beaker
    setEquipmentContents(prev => {
      const updated: { [key: string]: Chemical[] } = {
        ...prev,
        [mainBeaker.id]: [...(prev[mainBeaker.id] || []), chemical]
      }
      console.log(`✅ Added ${chemical.name}. Contents:`, (updated[mainBeaker.id] || []).map((c: Chemical) => c.name))
      return updated
    })

    // Fire step complete
    if (onStepComplete) {
      setTimeout(() => {
        const incompleteSteps = experiment.steps
          .map((step, index) => ({ step, index }))
          .filter(({ step }) => !step.completed)
        
        const targetStep = incompleteSteps.find(({ step }) =>
          step.chemicals.includes(chemical.id) &&
          step.equipment.includes('beaker')
        )
        
        if (targetStep) {
          console.log(`🎯 Step ${targetStep.index + 1} completed`)
          onStepComplete(targetStep.index, chemical)
        }
      }, 100)
    }
    
    // Check for reactions after adding chemical
    setTimeout(() => {
      // Get the updated equipment contents
      const updatedContents = equipmentContents[mainBeaker.id] || []
      const chemicalIds = updatedContents.map(c => c.id)
      
      console.log('🧪 Checking for reactions with chemicals:', chemicalIds)
      console.log('🧪 Experiment ID:', experiment.id)
      
      // Check if this triggers a reaction
      const reactionResult = checkReactionTrigger(chemicalIds, reactionLogicRef.current, experiment.id)
      
      if (reactionResult && onReactionTrigger) {
        console.log(`🧪 Reaction triggered: ${reactionResult.outcomeText}`)
        // Trigger visual effect for the reaction
        const reactionType = reactionResult.effects[0]?.type || 'color-change'
        const intensity = reactionResult.effects[0]?.intensity || 0.8
        onReactionTrigger(reactionType, mainBeaker.position, intensity)
      } else {
        console.log('🧪 No reaction triggered')
        if (chemicalIds.includes('phenolphthalein') && chemicalIds.includes('hcl') && chemicalIds.includes('naoh')) {
          console.log('🧪 All titration chemicals present but no reaction triggered')
        }
      }
    }, 500) // Slightly longer delay to ensure state is updated
    
    // Show pouring effect only for liquids
    if (chemical.properties.state === 'liquid') {
      setActivePouring({
        fromPosition: new THREE.Vector3(-6, 1.0, 0),
        toPosition: new THREE.Vector3(...mainBeaker.position),
        chemical,
        active: true
      })
      
      setTimeout(() => {
        setActivePouring(null)
      }, 2000)
    } else {
      // For solids, just reset the processing state immediately
      setTimeout(() => {
        processingRef.current = false
      }, 100)
    }
  }

  useImperativeHandle(ref, () => ({
    handleChemicalPour,
    resetBeaker: () => {
      console.log('🧹 Resetting beaker')
      setEquipmentContents({})
      addedChemicalsRef.current.clear()
    },
    getBeakerPosition: () => {
      const mainBeaker = equipmentLayout.find(item => item.type === 'beaker')
      return mainBeaker ? mainBeaker.position : [0, -0.25, 0] as [number, number, number]
    }
  }), [equipmentLayout])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        if (child.userData.floating) {
          child.position.y += Math.sin(state.clock.elapsedTime + index) * 0.002
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {equipmentLayout.map((item, index) => {
        const currentContents = equipmentContents[item.id] || []
        
        const equipmentProps = {
          position: [0, 0, 0] as [number, number, number],
          scale: item.scale,
          capacity: item.capacity,
          contents: currentContents,
          temperature: item.temperature,
          isHovered: hoveredItem === item.id,
          onPointerOver: () => setHoveredItem(item.id),
          onPointerOut: () => setHoveredItem(null)
        }

        const interactiveProps = {
          equipmentId: item.id,
          equipmentType: item.type,
          position: item.position,
          canReceiveLiquid: ['beaker', 'flask', 'test-tube', 'graduated-cylinder'].includes(item.type),
          onPour: (targetId: string) => handlePour(item.id, targetId)
        }
        
        const isMainBeaker = item.type === 'beaker' && index === equipmentLayout.findIndex(eq => eq.type === 'beaker')
        const { key: _key, ...propsWithoutKey } = interactiveProps as any

        switch (item.type) {
          case 'beaker':
            return (
              <group key={item.id}>
                <InteractiveEquipment {...propsWithoutKey}>
                  <Beaker 
                    position={equipmentProps.position}
                    scale={equipmentProps.scale}
                    capacity={equipmentProps.capacity}
                    contents={currentContents}
                    temperature={equipmentProps.temperature}
                    isHovered={equipmentProps.isHovered}
                    onPointerOver={equipmentProps.onPointerOver}
                    onPointerOut={equipmentProps.onPointerOut}
                  />
                </InteractiveEquipment>
                
              </group>
            )
          
          case 'flask':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey}>
                <Flask {...equipmentProps} />
              </InteractiveEquipment>
            )
          
          case 'test-tube':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey}>
                <TestTube {...equipmentProps} />
              </InteractiveEquipment>
            )
          
          case 'graduated-cylinder':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey}>
                <GraduatedCylinder {...equipmentProps} />
              </InteractiveEquipment>
            )
          
          case 'burette':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey} canReceiveLiquid={false}>
                <Burette {...equipmentProps} />
              </InteractiveEquipment>
            )
          
          case 'bunsen-burner':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey} canReceiveLiquid={false}>
                <BunsenBurner {...equipmentProps} isLit={item.isLit} />
              </InteractiveEquipment>
            )
          
          case 'stirring-rod':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey} canReceiveLiquid={false}>
                <StirringRod {...equipmentProps} />
              </InteractiveEquipment>
            )
          
          case 'thermometer':
            return (
              <InteractiveEquipment key={item.id} {...propsWithoutKey} canReceiveLiquid={false}>
                <Thermometer {...equipmentProps} />
              </InteractiveEquipment>
            )
          
          default:
            return null
        }
      })}
      
      {activePouring && (
        <PouringEffect
          fromPosition={activePouring.fromPosition}
          toPosition={activePouring.toPosition}
          chemical={activePouring.chemical}
          isActive={activePouring.active}
          onComplete={() => setActivePouring(null)}
        />
      )}

    </group>
  )
})

function getEquipmentLayout(experiment: Experiment) {
  const layout: any[] = []
  let xOffset = -4
  let zOffset = 2

  const tableLevel = -1.0
  const equipmentY = tableLevel + 0.75

  experiment.materials.forEach((material, index) => {
    const equipmentId = `${material.equipmentType}-${index}`
    
    const position: [number, number, number] = [
      xOffset + (index % 3) * 2.5,
      equipmentY,
      zOffset - Math.floor(index / 3) * 2
    ]

    const baseConfig = {
      id: equipmentId,
      type: material.equipmentType,
      name: getEquipmentName(material.equipmentType),
      position,
      scale: [1, 1, 1] as [number, number, number],
      capacity: 100,
      contents: [],
      temperature: 25,
      floating: false
    }

    switch (material.equipmentType) {
      case 'beaker':
        layout.push({ ...baseConfig, capacity: 250, contents: material.chemical ? [material.chemical] : [] })
        break
      case 'flask':
        layout.push({ ...baseConfig, capacity: 500, contents: material.chemical ? [material.chemical] : [], floating: true })
        break
      case 'test-tube':
        layout.push({ ...baseConfig, capacity: 20, scale: [0.8, 0.8, 0.8], contents: material.chemical ? [material.chemical] : [] })
        break
      case 'graduated-cylinder':
        layout.push({ ...baseConfig, capacity: 100, scale: [0.9, 0.9, 0.9] })
        break
      case 'burette':
        layout.push({ ...baseConfig, capacity: 50, position: [position[0], equipmentY + 0.2, position[2]], scale: [0.8, 1.2, 0.8] })
        break
      case 'bunsen-burner':
        layout.push({ ...baseConfig, isLit: false, temperature: 25, position: [position[0], equipmentY - 0.3, position[2]] })
        break
      case 'stirring-rod':
        layout.push({ ...baseConfig, scale: [1.2, 1.2, 1.2], position: [position[0], equipmentY, position[2]] })
        break
      case 'thermometer':
        layout.push({ ...baseConfig, scale: [0.6, 0.6, 0.6], position: [position[0], equipmentY + 0.5, position[2]], temperature: 25 })
        break
    }
  })

  return layout
}

function getEquipmentName(type: string): string {
  const names: Record<string, string> = {
    'beaker': 'Beaker',
    'flask': 'Erlenmeyer Flask',
    'test-tube': 'Test Tube',
    'graduated-cylinder': 'Graduated Cylinder',
    'burette': 'Burette',
    'bunsen-burner': 'Bunsen Burner',
    'stirring-rod': 'Stirring Rod',
    'thermometer': 'Thermometer'
  }
  return names[type] || type
}

export default LabEquipment