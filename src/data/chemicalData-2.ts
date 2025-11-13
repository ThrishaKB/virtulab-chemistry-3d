import { Chemical, ChemicalProperties } from '@/types'

// Common chemicals used in experiments
export const CHEMICALS: Record<string, Chemical> = {
  // Acids
  HCL: {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    color: '#F5F5F580', // Slightly transparent white with faint tint
    concentration: 0.1,
    ph: 1,
    properties: {
      state: 'liquid',
      color: '#F5F5F580', // Slightly transparent white with faint tint
      density: 1.02,
      boilingPoint: 108,
      meltingPoint: -30,
      solubility: 100,
      reactivity: ['base', 'metal', 'carbonate']
    }
  },
  
  H2SO4: {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    color: '#FFF8DC',
    concentration: 0.1,
    ph: 0.3,
    properties: {
      state: 'liquid',
      color: '#FFF8DC',
      density: 1.84,
      boilingPoint: 337,
      meltingPoint: 10,
      solubility: 100,
      reactivity: ['base', 'metal', 'organic']
    }
  },

  // Bases
  NAOH: {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    color: '#F8F8F880', // Slightly transparent white with faint tint
    concentration: 0.1,
    ph: 13,
    properties: {
      state: 'liquid',
      color: '#F8F8F880', // Slightly transparent white with faint tint
      density: 1.04,
      boilingPoint: 140,
      meltingPoint: 318,
      solubility: 100,
      reactivity: ['acid', 'organic', 'metal']
    }
  },

  NH3: {
    id: 'nh3',
    name: 'Ammonia Solution',
    formula: 'NH₃',
    color: '#F5F5DC',
    concentration: 0.1,
    ph: 11,
    properties: {
      state: 'liquid',
      color: '#F5F5DC',
      density: 0.90,
      boilingPoint: -33,
      meltingPoint: -78,
      solubility: 89,
      reactivity: ['acid']
    }
  },

  // Salts
  NACL: {
    id: 'nacl',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    color: '#F5F5F580', // Slightly transparent white for colorless solution
    properties: {
      state: 'solid',
      color: '#FFFFFF',
      density: 2.16,
      boilingPoint: 1465,
      meltingPoint: 801,
      solubility: 36,
      reactivity: []
    }
  },

  AGNO3: {
    id: 'agno3',
    name: 'Silver Nitrate',
    formula: 'AgNO₃',
    color: '#F5F5F580', // Slightly transparent white for colorless solution
    concentration: 0.1,
    properties: {
      state: 'liquid',
      color: '#F5F5F580', // Slightly transparent white for colorless solution
      density: 1.05,
      boilingPoint: 444,
      meltingPoint: 212,
      solubility: 256,
      reactivity: ['chloride', 'bromide', 'iodide']
    }
  },

  // Indicators
  PHENOLPHTHALEIN: {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    formula: 'C₂₀H₁₄O₄',
    color: '#FFE4E1',
    concentration: 0.001, // Very low concentration to simulate indicator sensitivity
    // Note: In experiments, only a few drops of phenolphthalein should be used
    properties: {
      state: 'liquid',
      color: '#FFE4E1',
      density: 1.28,
      boilingPoint: 550,
      meltingPoint: 258,
      solubility: 0.04,
      reactivity: ['base']
    }
  },

  LITMUS: {
    id: 'litmus',
    name: 'Litmus Solution',
    formula: 'C₇H₇NO₄',
    color: '#DDA0DD',
    properties: {
      state: 'liquid',
      color: '#DDA0DD',
      density: 1.0,
      boilingPoint: 100,
      meltingPoint: 0,
      solubility: 100,
      reactivity: ['acid', 'base']
    }
  },

  // Water
  H2O: {
    id: 'h2o',
    name: 'Distilled Water',
    formula: 'H₂O',
    color: '#E6F3FF',
    ph: 7,
    properties: {
      state: 'liquid',
      color: '#E6F3FF',
      density: 1.0,
      boilingPoint: 100,
      meltingPoint: 0,
      solubility: 100,
      reactivity: []
    }
  },

  // Copper compounds
  CUSO4: {
    id: 'cuso4',
    name: 'Copper Sulfate',
    formula: 'CuSO₄',
    color: '#4169E1', // Vibrant blue for copper sulfate solution
    concentration: 0.1,
    properties: {
      state: 'liquid',
      color: '#4169E1', // Vibrant blue for copper sulfate solution
      density: 1.07,
      boilingPoint: 150,
      meltingPoint: 200,
      solubility: 25,
      reactivity: ['base', 'metal']
    }
  },

  // Additional chemicals for expanded experiments
  CACO3: {
    id: 'caco3',
    name: 'Calcium Carbonate (Marble)',
    formula: 'CaCO₃',
    color: '#FFFFFF',
    properties: {
      state: 'solid',
      color: '#FFFFFF',
      density: 2.71,
      boilingPoint: 2850,
      meltingPoint: 1339,
      solubility: 0.0015,
      reactivity: ['acid']
    }
  },

  CU: {
    id: 'cu',
    name: 'Copper Wire',
    formula: 'Cu',
    color: '#A0522D', // Richer reddish-brown for copper metal
    properties: {
      state: 'solid',
      color: '#A0522D', // Richer reddish-brown for copper metal
      density: 8.96,
      boilingPoint: 2562,
      meltingPoint: 1085,
      solubility: 0,
      reactivity: ['acid', 'nitrate']
    }
  },

  AG: {
    id: 'ag',
    name: 'Silver Metal',
    formula: 'Ag',
    color: '#C0C0C0',
    properties: {
      state: 'solid',
      color: '#C0C0C0',
      density: 10.49,
      boilingPoint: 2162,
      meltingPoint: 962,
      solubility: 0,
      reactivity: []
    }
  },

  CO2: {
    id: 'co2',
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    color: '#F5F5F5',
    properties: {
      state: 'gas',
      color: '#F5F5F5',
      density: 0.00198,
      boilingPoint: -78,
      meltingPoint: -78,
      solubility: 0.033,
      reactivity: []
    }
  },

  // Additional chemicals for expanded experiments
  ZN: {
    id: 'zn',
    name: 'Zinc Metal',
    formula: 'Zn',
    color: '#696969', // Slightly darker gray for more realistic metallic zinc
    properties: {
      state: 'solid',
      color: '#696969', // Slightly darker gray for more realistic metallic zinc
      density: 7.14,
      boilingPoint: 907,
      meltingPoint: 420,
      solubility: 0,
      reactivity: ['acid']
    }
  },

  CH4: {
    id: 'ch4',
    name: 'Methane',
    formula: 'CH₄',
    color: '#F5F5F5',
    properties: {
      state: 'gas',
      color: '#F5F5F5',
      density: 0.00072,
      boilingPoint: -162,
      meltingPoint: -182,
      solubility: 0.022,
      reactivity: ['oxygen']
    }
  },

  H2O2: {
    id: 'h2o2',
    name: 'Hydrogen Peroxide',
    formula: 'H₂O₂',
    color: '#FFFFFF',
    concentration: 0.3,
    properties: {
      state: 'liquid',
      color: '#FFFFFF',
      density: 1.45,
      boilingPoint: 150,
      meltingPoint: -0.43,
      solubility: 100,
      reactivity: ['catalyst']
    }
  },

  O2: {
    id: 'o2',
    name: 'Oxygen Gas',
    formula: 'O₂',
    color: '#F5F5F5',
    properties: {
      state: 'gas',
      color: '#F5F5F5',
      density: 0.00143,
      boilingPoint: -183,
      meltingPoint: -218,
      solubility: 0.04,
      reactivity: ['fuel']
    }
  },

  ZNSO4: {
    id: 'znso4',
    name: 'Zinc Sulfate',
    formula: 'ZnSO₄',
    color: '#F5F5F5', // Nearly colorless for zinc sulfate solution
    properties: {
      state: 'solid',
      color: '#F5F5F5', // Nearly colorless for zinc sulfate solution
      density: 3.54,
      boilingPoint: 1500,
      meltingPoint: 680,
      solubility: 54,
      reactivity: []
    }
  },

  AGCL: {
    id: 'agcl',
    name: 'Silver Chloride',
    formula: 'AgCl',
    color: '#F8F8F8', // Off-white for silver chloride precipitate
    properties: {
      state: 'solid',
      color: '#F8F8F8', // Off-white for silver chloride precipitate
      density: 5.56,
      boilingPoint: 1547,
      meltingPoint: 455,
      solubility: 0.002,
      reactivity: []
    }
  }
}

// Color changes based on chemical reactions
export const COLOR_REACTIONS = {
  // Acid-base indicators
  'phenolphthalein-acid': '#FFE4E1',     // Colorless in acid
  'phenolphthalein-base': '#FF69B4',     // Pink in base
  'litmus-acid': '#FF6347',              // Red in acid  
  'litmus-base': '#4169E1',              // Blue in base
  'universal-acid': '#FF0000',           // Red for strong acid
  'universal-neutral': '#32CD32',        // Green for neutral
  'universal-base': '#9400D3',           // Purple for strong base

  // Precipitation reactions
  'agcl-precipitate': '#F8F8F8',         // Off-white precipitate for realistic silver chloride
  'agbr-precipitate': '#FFFACD',         // Pale yellow precipitate
  'agi-precipitate': '#FFFF00',          // Yellow precipitate
  'cu-hydroxide': '#87CEEB',             // Light blue precipitate

  // Redox reactions
  'copper-oxidized': '#228B22',          // Green copper oxide
  'iron-oxidized': '#8B4513',            // Brown iron oxide
  
  // Displacement reactions
  'cuso4-solution': '#4169E1',           // Blue copper sulfate solution
  'znso4-solution': '#F5F5F5',           // Colorless zinc sulfate solution
  'cu-deposit': '#A0522D'                // Richer reddish-brown copper metal
}
