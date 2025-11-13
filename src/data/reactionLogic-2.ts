import { Experiment, ChemicalReaction } from '@/types'

// Reaction logic mapping chemical combinations to visual effects
export interface ReactionLogic {
  [key: string]: {
    requiredChemicals: string[]
    effects: {
      type: 'color-change' | 'precipitation' | 'gas-evolution' | 'boiling' | 'smoke' | 'heat-release' | 'crystallization'
      color?: string
      particle?: string
      intensity: number
      duration: number
    }[]
    outcomeText: string
  }
}

// Generate reaction logic based on experiment data
export function generateReactionLogic(experiments: Experiment[]): ReactionLogic {
  const reactionLogic: ReactionLogic = {}
  
  experiments.forEach(experiment => {
    experiment.reactions.forEach(reaction => {
      // Create a unique key for this reaction based on the experiment and reaction
      const reactionKey = `${experiment.id}-${reaction.id}`
      
      reactionLogic[reactionKey] = {
        requiredChemicals: reaction.reactants,
        effects: reaction.effects.map(effect => ({
          type: effect.type as any,
          color: effect.color,
          particle: effect.particle,
          intensity: effect.intensity,
          duration: effect.duration
        })),
        outcomeText: `Reaction between ${reaction.reactants.join(' and ')} produced ${reaction.products.join(' and ')}`
      }
    })
    
    // Special case for acid-base indicator experiment
    if (experiment.id === 'acid-base-indicator') {
      // Add a special reaction for the endpoint detection with phenolphthalein
      const endpointKey = `${experiment.id}-endpoint`
      reactionLogic[endpointKey] = {
        requiredChemicals: ['naoh', 'phenolphthalein'],
        effects: [
          {
            type: 'color-change',
            color: '#FF69B4', // Pink color for phenolphthalein in basic solution
            intensity: 1.0,
            duration: 3000
          }
        ],
        outcomeText: 'Solution turned pink indicating basic conditions'
      }
      console.log('🧪 Added endpoint reaction for indicator:', endpointKey)
    }
    
    // Special case for displacement reaction
    if (experiment.id === 'displacement-reaction') {
      // Add a special reaction for the color change effect
      const colorChangeKey = `${experiment.id}-color-change`
      reactionLogic[colorChangeKey] = {
        requiredChemicals: ['zn', 'cuso4'],
        effects: [
          {
            type: 'color-change',
            color: '#F5F5F5', // Colorless for final ZnSO4 solution
            intensity: 0.9,
            duration: 12000 // Extended duration for more gradual color transition
          },
          {
            type: 'precipitation',
            color: '#A0522D', // Richer reddish-brown copper metal deposits
            intensity: 0.8,
            duration: 12000, // Extended duration to match color change
            particle: 'crystals'
          }
        ],
        outcomeText: 'Blue copper sulfate solution turned colorless and brown copper deposited'
      }
      console.log('🧪 Added color change reaction for displacement:', colorChangeKey)
    }
    
    // Special case for precipitation reaction
    if (experiment.id === 'precipitation-reaction') {
      // Add a special reaction for the precipitation effect
      const precipitateKey = `${experiment.id}-precipitate`
      reactionLogic[precipitateKey] = {
        requiredChemicals: ['agno3', 'nacl'],
        effects: [
          {
            type: 'precipitation',
            color: '#F8F8F8', // Slightly off-white for realistic silver chloride
            intensity: 1.0, // Increased intensity for more visible effect
            duration: 10000 // Extended duration for more gradual color transition and precipitate formation
          }
        ],
        outcomeText: 'White precipitate of silver chloride formed'
      }
      console.log('💎 Added precipitation reaction:', precipitateKey)
    }
    
    // Special case for decomposition reaction
    if (experiment.id === 'decomposition-reaction') {
      // Add a special reaction for the decomposition effect
      const decompositionKey = `${experiment.id}-decomposition`
      reactionLogic[decompositionKey] = {
        requiredChemicals: ['h2o2'],
        effects: [
          {
            type: 'gas-evolution',
            particle: 'bubble',
            intensity: 0.9,
            duration: 8000 // Extended duration for more realistic bubble formation
          },
          {
            type: 'heat-release',
            intensity: 0.6,
            duration: 5000 // Extended duration for gradual heating
          }
        ],
        outcomeText: 'Hydrogen peroxide decomposed into water and oxygen gas'
      }
      console.log('💨 Added decomposition reaction:', decompositionKey)
    }
  })
  
  return reactionLogic
}

// Check if a set of chemicals triggers a reaction
export function checkReactionTrigger(
  addedChemicals: string[], 
  reactionLogic: ReactionLogic,
  experimentId: string
): { reactionKey: string; effects: ReactionLogic[string]['effects']; outcomeText: string } | null {
  console.log('🧪 Checking reaction trigger with chemicals:', addedChemicals, 'for experiment:', experimentId)
  console.log('🧪 Reaction logic keys:', Object.keys(reactionLogic))
  
  // First check for special endpoint reactions (like phenolphthalein turning pink)
  for (const [reactionKey, reactionData] of Object.entries(reactionLogic)) {
    // Only check reactions for the current experiment
    if (!reactionKey.startsWith(experimentId)) continue;
    
    // Special handling for endpoint detection
    if (reactionKey.includes('-endpoint')) {
      console.log('🧪 Checking endpoint reaction:', reactionKey, 'with required chemicals:', reactionData.requiredChemicals)
      
      // Check if all required chemicals are present
      const hasAllChemicals = reactionData.requiredChemicals.every(chem => 
        addedChemicals.includes(chem)
      )
      
      console.log('🧪 Has all chemicals:', hasAllChemicals)
      
      if (hasAllChemicals) {
        console.log('🧪 Endpoint reaction triggered:', reactionKey)
        return {
          reactionKey,
          effects: reactionData.effects,
          outcomeText: reactionData.outcomeText
        }
      }
      continue;
    }
  }
  
  // Check each reaction in the logic
  for (const [reactionKey, reactionData] of Object.entries(reactionLogic)) {
    // Only check reactions for the current experiment
    if (!reactionKey.startsWith(experimentId)) continue;
    
    // Skip endpoint reactions in this loop
    if (reactionKey.includes('-endpoint')) continue;
    
    console.log('🧪 Checking regular reaction:', reactionKey, 'with required chemicals:', reactionData.requiredChemicals)
    
    // Check if all required chemicals are present
    const hasAllChemicals = reactionData.requiredChemicals.every(chem => 
      addedChemicals.includes(chem)
    )
    
    // Check if no extra chemicals that aren't part of the reaction
    const hasOnlyRequiredChemicals = addedChemicals.every(chem => 
      reactionData.requiredChemicals.includes(chem)
    )
    
    console.log('🧪 Has all chemicals:', hasAllChemicals, 'Has only required chemicals:', hasOnlyRequiredChemicals)
    
    if (hasAllChemicals && hasOnlyRequiredChemicals) {
      console.log('🧪 Regular reaction triggered:', reactionKey)
      return {
        reactionKey,
        effects: reactionData.effects,
        outcomeText: reactionData.outcomeText
      }
    }
  }
  
  return null
}