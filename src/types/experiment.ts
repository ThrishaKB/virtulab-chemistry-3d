export interface ChemicalProperties {
  state: 'solid' | 'liquid' | 'gas'
  color: string
  density: number
  boilingPoint: number
  meltingPoint: number
  solubility: number
  reactivity: string[]
}

export interface Chemical {
  id: string
  name: string
  formula: string
  color: string
  concentration?: number
  ph?: number
  properties: ChemicalProperties
}

export interface ExperimentStep {
  id: string
  instruction: string
  chemicals: string[]
  equipment: string[]
  action: 'measure' | 'pour' | 'heat' | 'observe' | 'stir'
  duration?: number
  temperature?: number
  safety?: string
  expectedObservation: string
  completed: boolean
}

export interface ExperimentMaterial {
  equipmentType: string
  quantity: number
  required: boolean
  chemical?: Chemical
}

export interface ChemicalReaction {
  id: string
  reactants: string[]
  products: string[]
  equation: string
  conditions: {
    temperature: number
    ph?: number
  }
  effects: {
    type: 'color-change' | 'precipitation' | 'gas-evolution' | 'heat-release' | 'boiling' | 'smoke' | 'crystallization'
    color?: string
    particle?: string
    intensity: number
    duration: number
  }[]
}

export interface Experiment {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  category: string
  objectives: string[]
  steps: ExperimentStep[]
  materials: ExperimentMaterial[]
  chemicals: Chemical[]
  safetyNotes: string[]
  expectedResults: string[]
  reactions: ChemicalReaction[]
}
