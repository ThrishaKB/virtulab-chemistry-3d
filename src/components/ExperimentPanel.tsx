import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Experiment, Chemical } from '@/types/experiment'

interface ExperimentPanelProps {
  experiment: Experiment
  currentStep: number
  onStepComplete: (stepIndex: number) => void
  onClose: () => void
  onChemicalAdd: (chemical: Chemical) => void
}

export default function ExperimentPanel({
  experiment,
  currentStep,
  onClose,
  onChemicalAdd,
}: ExperimentPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">{experiment.title}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Steps */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Procedure</h3>
            <div className="space-y-3">
              {experiment.steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    index === currentStep
                      ? 'border-primary bg-primary/10'
                      : step.completed
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">
                      {index + 1}.
                    </span>
                    <p className="text-sm text-foreground">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chemicals */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Available Chemicals</h3>
            <div className="space-y-2">
              {experiment.chemicals.map((chemical) => (
                <Button
                  key={chemical.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onChemicalAdd(chemical)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: chemical.color }}
                  />
                  <span>{chemical.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {chemical.formula}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
