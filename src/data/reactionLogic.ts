import { Experiment } from '@/types/experiment'

interface ReactionEffect {
  type: string
  intensity: number
}

interface ReactionResult {
  outcomeText: string
  effects: ReactionEffect[]
}

export function generateReactionLogic(experiments: Experiment[]) {
  const reactions: Record<string, ReactionResult> = {}
  
  experiments.forEach(exp => {
    const key = exp.id
    
    switch (exp.category.toLowerCase()) {
      case 'acid-base':
        reactions[key] = {
          outcomeText: 'Neutralization reaction occurred',
          effects: [{ type: 'color-change', intensity: 0.8 }]
        }
        break
      case 'precipitation':
        reactions[key] = {
          outcomeText: 'Precipitation reaction occurred',
          effects: [{ type: 'precipitation', intensity: 0.9 }]
        }
        break
      case 'combustion':
        reactions[key] = {
          outcomeText: 'Combustion reaction occurred',
          effects: [{ type: 'heat-release', intensity: 1.0 }]
        }
        break
      default:
        reactions[key] = {
          outcomeText: 'Reaction occurred',
          effects: [{ type: 'color-change', intensity: 0.7 }]
        }
    }
  })
  
  return reactions
}

export function checkReactionTrigger(
  chemicalIds: string[],
  reactionLogic: Record<string, ReactionResult>,
  experimentId: string
): ReactionResult | null {
  if (chemicalIds.length >= 2 && reactionLogic[experimentId]) {
    return reactionLogic[experimentId]
  }
  return null
}
