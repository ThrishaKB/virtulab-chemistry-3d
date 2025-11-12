'use client'

import { Suspense, useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Shield, Eye, Thermometer, Timer } from 'lucide-react'
import { Experiment } from '@/types'
import LabEnvironment from './3d/LabEnvironment'
import LabEquipment from './3d/LabEquipment'
import ExperimentPanel from './ExperimentPanel'
import LoadingScreen from './LoadingScreen'
import ReactionEffect from './3d/effects/ReactionEffect'

interface Lab3DProps {
  experiment: Experiment | null
  onBack: () => void
}

export default function Lab3D({ experiment, onBack }: Lab3DProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showSafety, setShowSafety] = useState(false)
  const [temperature, setTemperature] = useState(25)
  const [timer, setTimer] = useState(0)
  const [reactionState, setReactionState] = useState<{
    position: [number, number, number]
    type: 'acid-base' | 'precipitation' | 'gas-evolution' | 'color-change' | 'heat-release'
    intensity: number
    chemicals: string[]
    active: boolean
  } | null>(null)
  
  const controlsRef = useRef<any>(null)
  const labEquipmentRef = useRef<any>(null)
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const beakerPositionRef = useRef<[number, number, number]>([0, -0.25, 0])
  
  // Track completed steps to prevent duplicates
  const completedStepsRef = useRef<Set<number>>(new Set())

  const handleReactionComplete = useCallback(() => {
    setReactionState(null)
  }, [])

  const handleChemicalAdd = useCallback((chemical: any) => {
    console.log(`🧪 Lab3D: Adding ${chemical.name} to the beaker`)
    
    if (labEquipmentRef.current?.handleChemicalPour) {
      labEquipmentRef.current.handleChemicalPour(chemical)
      
      if (labEquipmentRef.current.getBeakerPosition) {
        beakerPositionRef.current = labEquipmentRef.current.getBeakerPosition()
      }
    } else {
      console.warn('LabEquipment ref not ready')
    }
  }, [])

  const handleReactionTrigger = useCallback((reactionType: string, position: [number, number, number], intensity: number) => {
    console.log(`🧪 Lab3D: Reaction triggered at position ${position}`)
    
    // Set the reaction state to trigger visual effects
    setReactionState({
      position,
      type: reactionType as any,
      intensity,
      chemicals: [], // This would be populated with actual chemicals in a more complex implementation
      active: true
    })
    
    // Clear the reaction state after the duration
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current)
    }
    reactionTimeoutRef.current = setTimeout(() => {
      setReactionState(null)
    }, 3000) // Duration should match the reaction effect duration
  }, [])

  const handleStepComplete = useCallback((stepIndex: number, chemical?: any) => {
    if (!experiment) return
    
    const chemicalName = chemical ? chemical.name : 'manual trigger'
    console.log(`✅ Lab3D: Completing step ${stepIndex + 1} with ${chemicalName}`)
    
    if (completedStepsRef.current.has(stepIndex)) {
      console.log(`Step ${stepIndex + 1} already completed, skipping`)
      return
    }
    
    completedStepsRef.current.add(stepIndex)
    experiment.steps[stepIndex].completed = true
    
    if (stepIndex === currentStep) {
      const nextStep = stepIndex + 1
      if (nextStep < experiment.steps.length) {
        setCurrentStep(nextStep)
        console.log(`Moving to step ${nextStep + 1}`)
      }
    }
  }, [experiment, currentStep])

  if (!experiment) {
    return <LoadingScreen />
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* 3D Scene */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [8, 5, 8], fov: 50 }}
          gl={{ 
            antialias: true,
            alpha: true,
          }}
        >
          {/* Lighting Setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, 0, -20]} intensity={0.5} />
          <pointLight position={[0, -10, 0]} intensity={0.3} />

          {/* Environment */}
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <LabEnvironment />
            <LabEquipment 
              ref={labEquipmentRef}
              experiment={experiment} 
              onStepComplete={handleStepComplete}
              onChemicalAdd={handleChemicalAdd}
              onReactionTrigger={handleReactionTrigger}
            />
            
            {/* Reaction Effects */}
            {reactionState && (
              <ReactionEffect
                position={reactionState.position}
                reactionType={reactionState.type}
                intensity={reactionState.intensity}
                isActive={reactionState.active}
                chemicals={reactionState.chemicals}
                onComplete={handleReactionComplete}
              />
            )}
            <ContactShadows
              position={[0, -1.0, 0]}
              opacity={0.4}
              scale={40}
              blur={1}
              far={40}
            />
          </Suspense>

          {/* Camera Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>

        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="glass flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </motion.button>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstructions(!showInstructions)}
                className={`glass p-3 rounded-lg transition-colors ${
                  showInstructions ? 'bg-blue-600/50 text-blue-200' : 'text-white hover:bg-white/10'
                }`}
              >
                <BookOpen size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSafety(!showSafety)}
                className={`glass p-3 rounded-lg transition-colors ${
                  showSafety ? 'bg-yellow-600/50 text-yellow-200' : 'text-white hover:bg-white/10'
                }`}
              >
                <Shield size={20} />
              </motion.button>
            </div>
          </div>

          {/* Lab Status */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <div className="glass p-4 rounded-lg space-y-3">
              <div className="flex items-center space-x-2 text-white">
                <Thermometer size={16} />
                <span className="text-sm">{temperature}°C</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Timer size={16} />
                <span className="text-sm">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Eye size={16} />
                <span className="text-sm">Step {currentStep + 1}/{experiment.steps.length}</span>
              </div>
            </div>
          </div>

          {/* Safety Alert */}
          <AnimatePresence>
            {showSafety && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="absolute top-20 right-4 w-80 glass p-4 rounded-lg pointer-events-auto"
              >
                <div className="flex items-start space-x-3">
                  <Shield className="text-yellow-400 mt-1" size={20} />
                  <div>
                    <h3 className="text-yellow-400 font-semibold mb-2">Safety Notes</h3>
                    <div className="space-y-2">
                      {experiment.safetyNotes.map((note, index) => (
                        <p key={index} className="text-yellow-200 text-sm">
                          • {note}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-96 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700"
          >
            <ExperimentPanel
              experiment={experiment}
              currentStep={currentStep}
              onStepComplete={(stepIndex) => {
                handleStepComplete(stepIndex)
              }}
              onClose={() => setShowInstructions(false)}
              onChemicalAdd={handleChemicalAdd}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}