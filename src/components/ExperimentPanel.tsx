'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  CheckCircle, 
  Circle, 
  Clock, 
  Thermometer, 
  AlertTriangle,
  Eye,
  Target,
  Book,
  Play
} from 'lucide-react'
import { Experiment, Chemical } from '@/types'
import { CHEMICALS } from '@/data/chemicalData'

interface ExperimentPanelProps {
  experiment: Experiment
  currentStep: number
  onStepComplete: (stepIndex: number) => void
  onClose: () => void
  onChemicalAdd?: (chemical: Chemical) => void
}

export default function ExperimentPanel({
  experiment,
  currentStep,
  onStepComplete,
  onClose,
  onChemicalAdd
}: ExperimentPanelProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'materials' | 'safety' | 'theory' | 'chemicals'>('steps')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20'  
      case 'advanced': return 'text-red-400 bg-red-500/20'
      default: return 'text-blue-400 bg-blue-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'acid-base': '🧪',
      'precipitation': '💎',
      'redox': '⚡',
      'thermal': '🔥',
      'gas-evolution': '💨',
      'crystallization': '❄️'
    }
    return icons[category] || '🔬'
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(experiment.category)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(experiment.difficulty)}`}>
                {experiment.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">
              {experiment.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{experiment.duration}min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target size={14} />
                <span>Step {currentStep + 1}/{experiment.steps.length}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('steps')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'steps'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Play size={16} />
          <span>Steps</span>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'materials'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Book size={16} />
          <span>Materials</span>
        </button>
        <button
          onClick={() => setActiveTab('chemicals')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chemicals'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          🧪
          <span>Chemicals</span>
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'safety'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <AlertTriangle size={16} />
          <span>Safety</span>
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'theory'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Target size={16} />
          <span>Theory</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'steps' && (
          <div className="p-4 space-y-4">
            {experiment.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  index === currentStep
                    ? 'border-blue-500 bg-blue-500/10'
                    : index < currentStep
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => onStepComplete(index)}
                    className={`mt-1 transition-colors ${
                      step.completed 
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {step.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-white">
                        Step {index + 1}
                      </span>
                      {step.duration && (
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Clock size={12} />
                          <span>{step.duration}s</span>
                        </div>
                      )}
                      {step.temperature && (
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Thermometer size={12} />
                          <span>{step.temperature}°C</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-3">
                      {step.instruction}
                    </p>
                    
                    {step.expectedObservation && (
                      <div className="flex items-start space-x-2 mb-2">
                        <Eye className="text-blue-400 mt-0.5" size={14} />
                        <div>
                          <span className="text-xs text-blue-400 font-medium">Expected:</span>
                          <p className="text-xs text-slate-400 mt-1">
                            {step.expectedObservation}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {step.safety && (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="text-yellow-400 mt-0.5" size={14} />
                        <div>
                          <span className="text-xs text-yellow-400 font-medium">Safety:</span>
                          <p className="text-xs text-slate-400 mt-1">
                            {step.safety}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4">Required Materials</h3>
            {experiment.materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div>
                  <div className="text-white text-sm font-medium capitalize">
                    {material.equipmentType.replace('-', ' ')}
                  </div>
                  {material.chemical && (
                    <div className="text-slate-400 text-xs">
                      {material.chemical.name} ({material.chemical.formula})
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-slate-300 text-sm">
                    Qty: {material.quantity}
                  </div>
                  {material.required && (
                    <div className="text-red-400 text-xs">Required</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chemicals' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              🧪 Available Chemicals
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Click on chemicals to add them to the main beaker
            </p>
            <div className="space-y-3">
              {/* Show only chemicals relevant to this experiment */}
              {Object.values(CHEMICALS)
                .filter(chemical => {
                  // Check if chemical is used in any step or reaction
                  const inSteps = experiment.steps.some(step => 
                    step.chemicals.includes(chemical.id)
                  )
                  const inReactions = experiment.reactions.some(reaction => 
                    reaction.reactants.includes(chemical.id) || 
                    reaction.products.includes(chemical.id)
                  )
                  return inSteps || inReactions
                })
                .map((chemical) => {
                  // Check if this chemical is required for reactions or steps
                  const isRequired = experiment.reactions.some(reaction => 
                    reaction.reactants.includes(chemical.id)
                  ) || experiment.steps.some(step => 
                    step.chemicals.includes(chemical.id)
                  )
                  
                  const handleChemicalClick = () => {
                    setSelectedChemical(chemical.id)
                    if (onChemicalAdd) {
                      onChemicalAdd(chemical)
                    }
                    // Reset selection after a moment
                    setTimeout(() => setSelectedChemical(null), 1000)
                  }
                  
                  return (
                    <button
                      key={chemical.id}
                      onClick={handleChemicalClick}
                      disabled={!isRequired}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        selectedChemical === chemical.id
                          ? 'border-green-500 bg-green-500/20'
                          : isRequired
                          ? 'border-slate-600 bg-slate-800/50 hover:border-blue-500 hover:bg-blue-500/10'
                          : 'border-slate-700 bg-slate-800/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Chemical Color Indicator */}
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: chemical.color || '#ffffff' }}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white text-sm">{chemical.name}</h4>
                            {selectedChemical === chemical.id ? (
                              <span className="text-green-400 text-xs font-medium">Added!</span>
                            ) : isRequired ? (
                              <span className="text-green-400 text-xs">Required</span>
                            ) : (
                              <span className="text-red-400 text-xs">Not required</span>
                            )}
                          </div>
                          
                          <p className="text-slate-400 text-xs">{chemical.formula}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              chemical.properties?.state === 'liquid' ? 'bg-blue-500/20 text-blue-300' :
                              chemical.properties?.state === 'solid' ? 'bg-gray-500/20 text-gray-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {chemical.properties?.state || 'unknown'}
                            </span>
                            
                            {chemical.concentration && (
                              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                                {(chemical.concentration * 100).toFixed(1)}M
                              </span>
                            )}
                            
                            {chemical.ph && (
                              <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-300">
                                pH: {chemical.ph}
                              </span>
                            )}
                            
                            {!isRequired && (
                              <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">
                                Not required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
            
            {/* Footer Tip */}
            <div className="mt-6 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-xs">
                💡 <strong>Tip:</strong> Add chemicals in the correct order according to the experiment steps for proper reactions!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="text-yellow-400 mr-2" size={20} />
              Safety Precautions
            </h3>
            <div className="space-y-3">
              {experiment.safetyNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <AlertTriangle className="text-yellow-400 mt-0.5" size={16} />
                  <p className="text-slate-300 text-sm">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theory' && (
          <div className="p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {experiment.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Learning Objectives</h3>
                <div className="space-y-2">
                  {experiment.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Target className="text-blue-400 mt-0.5" size={14} />
                      <p className="text-slate-300 text-sm">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Expected Results</h3>
                <div className="space-y-2">
                  {experiment.expectedResults.map((result, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Eye className="text-green-400 mt-0.5" size={14} />
                      <p className="text-slate-300 text-sm">{result}</p>
                    </div>
                  ))}
                </div>
              </div>

              {experiment.reactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Chemical Reactions</h3>
                  <div className="space-y-3">
                    {experiment.reactions.map((reaction, index) => (
                      <div
                        key={reaction.id}
                        className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                      >
                        <div className="text-blue-400 text-sm font-mono mb-2">
                          {reaction.equation}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="text-slate-400">
                            Reactants: {reaction.reactants.join(', ')}
                          </span>
                          <span className="text-slate-400">
                            Products: {reaction.products.join(', ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? '⏸️' : '▶️'}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
          </div>

          <div className="text-sm text-slate-400">
            {experiment.steps.filter(step => step.completed).length} of {experiment.steps.length} completed
          </div>
        </div>
      </div>
    </div>
  )
}