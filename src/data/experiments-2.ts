import { Experiment, ChemicalReaction } from '@/types'
import { CHEMICALS } from './chemicalData-2'

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'neutralization-reaction',
    title: 'Neutralization Reaction',
    description: 'Demonstrate the neutralization reaction between hydrochloric acid and sodium hydroxide to form salt and water.',
    difficulty: 'beginner',
    duration: 15,
    category: 'acid-base',
    objectives: [
      'Understand acid-base neutralization',
      'Observe the formation of salt and water',
      'Learn about exothermic reactions'
    ],
    materials: [
      { equipmentType: 'beaker', quantity: 2, required: true },
      { equipmentType: 'graduated-cylinder', quantity: 2, required: true }
    ],
    chemicals: [CHEMICALS.HCL, CHEMICALS.NAOH, CHEMICALS.NACL, CHEMICALS.H2O],
    steps: [
      {
        id: 'step1',
        instruction: 'Measure 50mL of 0.1M HCl solution',
        equipment: ['graduated-cylinder'],
        chemicals: ['hcl'],
        action: 'measure',
        expectedObservation: 'Clear acidic solution measured',
        completed: false
      },
      {
        id: 'step2',
        instruction: 'Pour HCl into the reaction beaker',
        equipment: ['beaker', 'graduated-cylinder'],
        chemicals: ['hcl'],
        action: 'pour',
        expectedObservation: 'Clear solution in beaker',
        completed: false
      },
      {
        id: 'step3',
        instruction: 'Measure 50mL of 0.1M NaOH solution',
        equipment: ['graduated-cylinder'],
        chemicals: ['naoh'],
        action: 'measure',
        expectedObservation: 'Clear basic solution measured',
        completed: false
      },
      {
        id: 'step4',
        instruction: 'Slowly pour NaOH into the reaction beaker with HCl',
        equipment: ['beaker', 'graduated-cylinder'],
        chemicals: ['naoh'],
        action: 'pour',
        expectedObservation: 'Solution becomes warm due to exothermic reaction',
        completed: false
      }
    ],
    safetyNotes: [
      'Wear safety goggles and gloves',
      'Handle acids and bases carefully',
      'NaOH is caustic and can cause burns',
      'HCl is corrosive - avoid skin contact'
    ],
    expectedResults: [
      'Formation of sodium chloride and water',
      'Temperature increase due to exothermic reaction',
      'Neutral pH solution (around 7)'
    ],
    reactions: [
      {
        id: 'neutralization',
        reactants: ['hcl', 'naoh'],
        products: ['nacl', 'h2o'],
        equation: 'HCl + NaOH → NaCl + H₂O',
        conditions: { temperature: 25 },
        effects: [
          {
            type: 'heat-release',
            intensity: 0.7,
            duration: 3000
          }
        ]
      }
    ]
  },

  {
    id: 'precipitation-reaction',
    title: 'Precipitation Reaction',
    description: 'Observe the formation of a precipitate when silver nitrate reacts with sodium chloride.',
    difficulty: 'beginner',
    duration: 10,
    category: 'precipitation',
    objectives: [
      'Understand precipitation reactions',
      'Observe the formation of insoluble products',
      'Learn about solubility rules'
    ],
    materials: [
      { equipmentType: 'test-tube', quantity: 2, required: true },
      { equipmentType: 'beaker', quantity: 1, required: true }
    ],
    chemicals: [CHEMICALS.NACL, CHEMICALS.AGNO3, CHEMICALS.AGCL, CHEMICALS.NANO3],
    steps: [
      {
        id: 'step1',
        instruction: 'Add sodium chloride solution to a test tube',
        equipment: ['test-tube'],
        chemicals: ['nacl'],
        action: 'pour',
        expectedObservation: 'Clear solution in test tube',
        completed: false
      },
      {
        id: 'step2',
        instruction: 'Add silver nitrate solution to the same test tube',
        equipment: ['test-tube'],
        chemicals: ['agno3'],
        action: 'pour',
        expectedObservation: 'Immediate formation of white precipitate',
        completed: false
      },
      {
        id: 'step3',
        instruction: 'Observe and record the precipitate formation',
        equipment: ['test-tube'],
        chemicals: [],
        action: 'observe',
        duration: 30,
        expectedObservation: 'White solid settles at the bottom of the tube',
        completed: false
      }
    ],
    safetyNotes: [
      'Silver nitrate stains skin and clothing',
      'Wear gloves when handling AgNO₃',
      'Dispose of silver waste properly'
    ],
    expectedResults: [
      'Formation of white silver chloride precipitate',
      'Clear solution becomes cloudy',
      'Precipitate settles at the bottom'
    ],
    reactions: [
      {
        id: 'precipitation',
        reactants: ['agno3', 'nacl'],
        products: ['agcl', 'nano3'],
        equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
        conditions: { temperature: 25 },
        effects: [
          {
            type: 'precipitation',
            intensity: 1.0, // Increased intensity for more visible effect
            duration: 10000, // Extended duration for more gradual color transition and precipitate formation
            color: '#F8F8F8' // Slightly off-white for realistic silver chloride
          }
        ]
      }
    ]
  },

  {
    id: 'displacement-reaction',
    title: 'Displacement Reaction',
    description: 'Demonstrate a metal displacement reaction between zinc and copper sulfate.',
    difficulty: 'intermediate',
    duration: 20,
    category: 'redox',
    objectives: [
      'Understand single displacement reactions',
      'Observe metal activity series',
      'Learn about redox reactions'
    ],
    materials: [
      { equipmentType: 'beaker', quantity: 1, required: true },
      { equipmentType: 'test-tube', quantity: 1, required: true }
    ],
    chemicals: [CHEMICALS.CUSO4, CHEMICALS.ZN, CHEMICALS.CU, CHEMICALS.ZNSO4],
    steps: [
      {
        id: 'step1',
        instruction: 'Add copper sulfate solution to the beaker',
        equipment: ['beaker'],
        chemicals: ['cuso4'],
        action: 'pour',
        expectedObservation: 'Blue solution in beaker',
        completed: false
      },
      {
        id: 'step2',
        instruction: 'Add zinc metal pieces to the copper sulfate solution',
        equipment: ['beaker'],
        chemicals: ['zn'],
        action: 'pour',
        expectedObservation: 'Zinc pieces sink to the bottom',
        completed: false
      },
      {
        id: 'step3',
        instruction: 'Observe the reaction over 10 minutes',
        equipment: ['beaker'],
        chemicals: [],
        action: 'observe',
        duration: 600,
        expectedObservation: 'Blue solution fades, brown copper deposits form on zinc',
        completed: false
      }
    ],
    safetyNotes: [
      'Handle copper sulfate carefully - it\'s toxic',
      'Do not ingest any chemicals',
      'Wash hands after handling chemicals'
    ],
    expectedResults: [
      'Blue solution gradually becomes colorless',
      'Brown copper metal deposits on zinc pieces',
      'Zinc dissolves into solution'
    ],
    reactions: [
      {
        id: 'displacement',
        reactants: ['zn', 'cuso4'],
        products: ['znso4', 'cu'],
        equation: 'Zn + CuSO₄ → ZnSO₄ + Cu',
        conditions: { temperature: 25 },
        effects: [
          {
            type: 'color-change',
            intensity: 0.9,
            duration: 12000, // Extended duration for more gradual color transition
            color: '#F5F5F5' // Colorless for final ZnSO4 solution
          },
          {
            type: 'precipitation',
            intensity: 0.8,
            duration: 12000, // Extended duration to match color change
            color: '#A0522D' // Richer reddish-brown copper metal deposits
          }
        ]
      }
    ]
  },

  {
    id: 'combustion-reaction',
    title: 'Combustion Reaction',
    description: 'Demonstrate the combustion of methane in the presence of oxygen.',
    difficulty: 'intermediate',
    duration: 15,
    category: 'gas-evolution',
    objectives: [
      'Understand combustion reactions',
      'Observe the products of complete combustion',
      'Learn about exothermic reactions'
    ],
    materials: [
      { equipmentType: 'beaker', quantity: 1, required: true },
      { equipmentType: 'bunsen-burner', quantity: 1, required: true }
    ],
    chemicals: [CHEMICALS.CH4, CHEMICALS.O2, CHEMICALS.CO2, CHEMICALS.H2O],
    steps: [
      {
        id: 'step1',
        instruction: 'Set up Bunsen burner with gas supply',
        equipment: ['bunsen-burner'],
        chemicals: ['ch4'],
        action: 'observe',
        expectedObservation: 'Gas line connected to burner',
        completed: false
      },
      {
        id: 'step2',
        instruction: 'Light the Bunsen burner and adjust flame',
        equipment: ['bunsen-burner'],
        chemicals: ['ch4', 'o2'],
        action: 'heat',
        expectedObservation: 'Blue flame appears',
        completed: false
      },
      {
        id: 'step3',
        instruction: 'Observe the combustion products',
        equipment: ['beaker'],
        chemicals: ['co2', 'h2o'],
        action: 'observe',
        expectedObservation: 'Water vapor condenses, CO₂ is produced',
        completed: false
      }
    ],
    safetyNotes: [
      'Ensure good ventilation when working with gases',
      'Keep flammable materials away from flame',
      'Use proper Bunsen burner technique',
      'Never leave flame unattended'
    ],
    expectedResults: [
      'Blue flame indicating complete combustion',
      'Production of carbon dioxide and water',
      'Heat and light energy released'
    ],
    reactions: [
      {
        id: 'combustion',
        reactants: ['ch4', 'o2'],
        products: ['co2', 'h2o'],
        equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        conditions: { temperature: 800 },
        effects: [
          {
            type: 'heat-release',
            intensity: 0.9,
            duration: 4000
          },
          {
            type: 'gas-evolution',
            intensity: 0.8,
            duration: 3000,
            particle: 'bubble'
          }
        ]
      }
    ]
  },

  {
    id: 'decomposition-reaction',
    title: 'Decomposition Reaction',
    description: 'Observe the decomposition of hydrogen peroxide into water and oxygen.',
    difficulty: 'beginner',
    duration: 12,
    category: 'thermal',
    objectives: [
      'Understand decomposition reactions',
      'Observe catalyst effects',
      'Learn about oxygen production'
    ],
    materials: [
      { equipmentType: 'beaker', quantity: 1, required: true },
      { equipmentType: 'test-tube', quantity: 1, required: true },
      { equipmentType: 'bunsen-burner', quantity: 1, required: true }
    ],
    chemicals: [CHEMICALS.H2O2, CHEMICALS.H2O, CHEMICALS.O2],
    steps: [
      {
        id: 'step1',
        instruction: 'Add hydrogen peroxide solution to the beaker',
        equipment: ['beaker'],
        chemicals: ['h2o2'],
        action: 'pour',
        expectedObservation: 'Clear solution in beaker',
        completed: false
      },
      {
        id: 'step2',
        instruction: 'Gently heat the hydrogen peroxide solution',
        equipment: ['beaker', 'bunsen-burner'],
        chemicals: ['h2o2'],
        action: 'heat',
        temperature: 60,
        expectedObservation: 'Slow bubbling begins',
        completed: false
      },
      {
        id: 'step3',
        instruction: 'Add a small amount of catalyst (MnO₂)',
        equipment: ['beaker'],
        chemicals: ['h2o2'],
        action: 'pour',
        expectedObservation: 'Rapid bubbling and oxygen production',
        completed: false
      }
    ],
    safetyNotes: [
      'Hydrogen peroxide can cause skin irritation',
      'Wear safety goggles during heating',
      'Handle hot equipment carefully',
      'Concentrated H₂O₂ is a strong oxidizer'
    ],
    expectedResults: [
      'Rapid evolution of oxygen gas',
      'Formation of water as a product',
      'Temperature increase during reaction'
    ],
    reactions: [
      {
        id: 'decomposition',
        reactants: ['h2o2'],
        products: ['h2o', 'o2'],
        equation: '2H₂O₂ → 2H₂O + O₂↑',
        conditions: { temperature: 60 },
        effects: [
          {
            type: 'gas-evolution',
            intensity: 0.9,
            duration: 8000, // Extended duration for more realistic bubble formation
            particle: 'bubble'
          },
          {
            type: 'heat-release',
            intensity: 0.6,
            duration: 5000 // Extended duration for gradual heating
          }
        ]
      }
    ]
  },

  {
    id: 'acid-base-indicator',
    title: 'Acid-Base Indicator Reaction',
    description: 'Use phenolphthalein as an indicator to observe pH changes in acid-base reactions.',
    difficulty: 'beginner',
    duration: 10,
    category: 'acid-base',
    objectives: [
      'Understand acid-base indicators',
      'Observe color changes with pH',
      'Learn about endpoint detection in titrations'
    ],
    materials: [
      { equipmentType: 'beaker', quantity: 2, required: true },
      { equipmentType: 'graduated-cylinder', quantity: 2, required: true }
    ],
    chemicals: [CHEMICALS.NAOH, CHEMICALS.PHENOLPHTHALEIN, CHEMICALS.HCL],
    steps: [
      {
        id: 'step1',
        instruction: 'Add sodium hydroxide solution to a beaker',
        equipment: ['beaker'],
        chemicals: ['naoh'],
        action: 'pour',
        expectedObservation: 'Clear basic solution',
        completed: false
      },
      {
        id: 'step2',
        instruction: 'Add a few drops of phenolphthalein indicator',
        equipment: ['beaker'],
        chemicals: ['phenolphthalein'],
        action: 'pour',
        expectedObservation: 'Solution turns light pink immediately',
        completed: false
      },
      {
        id: 'step3',
        instruction: 'Slowly add hydrochloric acid to the pink solution',
        equipment: ['beaker', 'graduated-cylinder'],
        chemicals: ['hcl'],
        action: 'pour',
        expectedObservation: 'Pink color fades to colorless at endpoint',
        completed: false
      }
    ],
    safetyNotes: [
      'Wear safety goggles and gloves',
      'Handle acids and bases carefully',
      'Phenolphthalein is a mild irritant',
      'Work in well-ventilated area'
    ],
    expectedResults: [
      'Solution turns light pink in basic conditions',
      'Color change to colorless at neutralization point',
      'Sharp color transition indicates endpoint'
    ],
    reactions: [
      {
        id: 'indicator-base',
        reactants: ['naoh', 'phenolphthalein'],
        products: ['pink-solution'],
        equation: 'NaOH + Phenolphthalein → Pink Solution',
        conditions: { temperature: 25, ph: 10 },
        effects: [
          {
            type: 'color-change',
            intensity: 0.5, // Reduced intensity for lighter color
            duration: 2000,
            color: '#F8A8D8' // Light pink color
          }
        ]
      },
      {
        id: 'indicator-acid',
        reactants: ['hcl', 'pink-solution'],
        products: ['colorless-solution'],
        equation: 'HCl + Pink Solution → Colorless Solution',
        conditions: { temperature: 25, ph: 7 },
        effects: [
          {
            type: 'color-change',
            intensity: 0.8,
            duration: 2000,
            color: '#FFFFFF' // Colorless
          }
        ]
      }
    ]
  }
]