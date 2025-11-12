export interface Chemical {
  id: string
  name: string
  formula: string
  color: string
  properties: {
    state: 'solid' | 'liquid' | 'gas'
    ph?: number
    concentration?: string
  }
}

export interface ExperimentStep {
  instruction: string
  chemicals: string[]
  equipment: string[]
  completed?: boolean
}

export interface ExperimentMaterial {
  equipmentType: string
  chemical?: Chemical
}

export interface Experiment {
  id: string
  title: string
  description: string
  difficulty: string
  duration: string
  category: string
  steps: ExperimentStep[]
  materials: ExperimentMaterial[]
  chemicals: Chemical[]
  safetyNotes: string[]
}
