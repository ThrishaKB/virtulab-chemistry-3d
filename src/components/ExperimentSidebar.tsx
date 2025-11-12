import { useState } from "react";
import { ExperimentMaterials, Chemical } from "@/config/experimentMaterials";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { CheckCircle2, Circle, Beaker, TestTube2, AlertTriangle, BookOpen, Target, Flame } from "lucide-react";
import { Button } from "./ui/button";

interface ExperimentSidebarProps {
  experimentData: ExperimentMaterials;
  completedSteps: number[];
  onChemicalClick: (chemicalId: string) => void;
  onEquipmentClick: (equipmentType: string) => void;
  addedChemicals: string[];
}

export const ExperimentSidebar = ({
  experimentData,
  completedSteps,
  onChemicalClick,
  onEquipmentClick,
  addedChemicals,
}: ExperimentSidebarProps) => {
  const [activeTab, setActiveTab] = useState("steps");

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "beaker":
        return <Beaker className="w-4 h-4" />;
      case "flask":
        return <Beaker className="w-4 h-4" />;
      case "test-tube":
        return <TestTube2 className="w-4 h-4" />;
      default:
        return <Beaker className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-[400px] h-full glass-panel border-accent/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{experimentData.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <span className="mr-1">🧪</span>
                {experimentData.chemicals.length} Chemicals
              </Badge>
              <Badge variant="outline" className="text-xs">
                10min
              </Badge>
              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                beginner
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
          <TabsTrigger value="steps" className="text-xs">Steps</TabsTrigger>
          <TabsTrigger value="materials" className="text-xs">Materials</TabsTrigger>
          <TabsTrigger value="chemicals" className="text-xs">Chemicals</TabsTrigger>
          <TabsTrigger value="safety" className="text-xs">Safety</TabsTrigger>
          <TabsTrigger value="theory" className="text-xs">Theory</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Steps Tab */}
          <TabsContent value="steps" className="p-4 space-y-3 mt-0">
            {experimentData.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-card/50 border-border/50"
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary">Step {index + 1}</span>
                    </div>
                    <p className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {step}
                    </p>
                    {!isCompleted && index === 0 && (
                      <div className="mt-2 p-2 bg-primary/10 rounded border border-primary/20">
                        <p className="text-xs text-primary font-medium">
                          <span className="mr-1">👁️</span>
                          Expected: Clear basic solution
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="p-4 space-y-4 mt-0">
            <div>
              <h3 className="text-sm font-bold mb-3 text-foreground">Required Equipment</h3>
              <div className="space-y-2">
                {experimentData.equipment.map((equipment) => (
                  <Button
                    key={equipment.id}
                    variant="outline"
                    className="w-full justify-between hover:bg-accent/50"
                    onClick={() => onEquipmentClick(equipment.type)}
                  >
                    <div className="flex items-center gap-2">
                      {getEquipmentIcon(equipment.type)}
                      <span className="text-sm">{equipment.name}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Chemicals Tab */}
          <TabsContent value="chemicals" className="p-4 space-y-3 mt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Click on chemicals to add them to the main beaker
            </p>
            {experimentData.chemicals.map((chemical) => {
              const isAdded = addedChemicals.includes(chemical.id);
              return (
                <Button
                  key={chemical.id}
                  variant="outline"
                  className={`w-full p-4 h-auto justify-start hover:bg-accent/50 ${
                    isAdded ? "border-green-500/50 bg-green-500/10" : ""
                  }`}
                  onClick={() => onChemicalClick(chemical.id)}
                  disabled={isAdded}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: chemical.color }}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{chemical.name}</span>
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{chemical.formula}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{chemical.state}</Badge>
                        <Badge variant="outline" className="text-xs">10.0M</Badge>
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="p-4 space-y-3 mt-0">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-bold text-foreground">Safety Precautions</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Wear safety goggles and gloves</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Handle acids and bases carefully</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">
                  {experimentData.experimentId === "combustion"
                    ? "Keep flammable materials away from flame"
                    : "Work in well-ventilated area"}
                </span>
              </div>
            </div>
          </TabsContent>

          {/* Theory Tab */}
          <TabsContent value="theory" className="p-4 space-y-4 mt-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Description</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {experimentData.experimentId === "neutralization" &&
                  "Use phenolphthalein as an indicator to observe pH changes in acid-base reactions."}
                {experimentData.experimentId === "precipitation" &&
                  "Observe the formation of an insoluble solid when two solutions are mixed."}
                {experimentData.experimentId === "displacement" &&
                  "Watch as a more reactive metal displaces a less reactive metal from its compound."}
                {experimentData.experimentId === "combustion" &&
                  "Study the rapid reaction between a fuel and oxygen, producing heat and light."}
                {experimentData.experimentId === "decomposition" &&
                  "Observe how hydrogen peroxide breaks down into water and oxygen gas with a catalyst."}
                {experimentData.experimentId === "acid-base" &&
                  "Use universal indicator to observe pH changes in acid-base reactions."}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Learning Objectives</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="w-3 h-3 mt-1 text-primary fill-primary" />
                  <span>Understand chemical reaction types</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="w-3 h-3 mt-1 text-primary fill-primary" />
                  <span>Observe color changes and indicators</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="w-3 h-3 mt-1 text-primary fill-primary" />
                  <span>Practice safe laboratory techniques</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Chemical Reactions</h3>
              </div>
              <div className="space-y-2">
                {experimentData.reactions.map((reaction, index) => (
                  <div key={index} className="p-3 bg-card/50 rounded-lg border border-border/50">
                    <code className="text-xs text-primary font-mono">
                      {reaction.reactants.join(" + ")} → {reaction.product.name}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};
