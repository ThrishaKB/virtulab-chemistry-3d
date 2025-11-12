import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Lab3D from "@/components/Lab3D";
import { useToast } from "@/hooks/use-toast";
import { experimentMaterials } from "@/config/experimentMaterials";
import type { Experiment as ExperimentType } from "@/types/experiment";

interface ExperimentData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  category: string;
}

const Experiment = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (experimentId) {
      fetchExperiment();
      updateProgress();
    }
  }, [experimentId]);

  const fetchExperiment = async () => {
    try {
      const { data, error } = await supabase
        .from("experiments")
        .select("*")
        .eq("id", experimentId)
        .single();

      if (error) throw error;
      setExperiment(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load experiment",
        variant: "destructive",
      });
      navigate("/lab");
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("experiment_id", experimentId)
        .maybeSingle();

      if (!existingProgress) {
        // Create new progress entry
        await supabase.from("user_progress").insert({
          user_id: user.id,
          experiment_id: experimentId,
          progress_percentage: 0,
          last_accessed_at: new Date().toISOString(),
        });
      } else {
        // Update last accessed
        await supabase
          .from("user_progress")
          .update({ last_accessed_at: new Date().toISOString() })
          .eq("id", existingProgress.id);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const markAsComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          experiment_id: experimentId,
          completed: true,
          progress_percentage: 100,
          last_accessed_at: new Date().toISOString(),
        });

      toast({
        title: "Congratulations! 🎉",
        description: "You've completed this experiment!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-xl text-foreground/60 animate-pulse">Loading experiment...</div>
      </div>
    );
  }

  if (!experiment) {
    return null;
  }

  // Get experiment materials configuration
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const getExperimentKey = (title: string): string => {
    const t = normalize(title);

    // Exact title mappings (normalized)
    const map: Record<string, string> = {
      [normalize("Neutralization Reaction")]: "neutralization",
      [normalize("Precipitation Reaction")]: "precipitation",
      [normalize("Displacement Reaction")]: "displacement",
      [normalize("Combustion Reaction")]: "combustion",
      [normalize("Decomposition Reaction")]: "decomposition",
      [normalize("Acid-Base Indicator Reaction")]: "acid-base",
      [normalize("Acid Base Indicator Reaction")]: "acid-base",
    };

    if (map[t]) return map[t];

    // Fuzzy contains fallback
    if (t.includes("neutral")) return "neutralization";
    if (t.includes("precip")) return "precipitation";
    if (t.includes("displac")) return "displacement";
    if (t.includes("combust")) return "combustion";
    if (t.includes("decompos")) return "decomposition";
    if (t.includes("acid") || t.includes("indicator")) return "acid-base";
    return "";
  };

  const experimentKey = getExperimentKey(experiment.title);
  const materials = experimentMaterials[experimentKey];

  if (!materials) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-xl text-foreground/60 text-center">
          Experiment configuration not found for "{experiment.title}"
          <br />
          <span className="text-sm">Key attempted: {experimentKey || '—'}</span>
        </div>
      </div>
    );
  }

  // Convert materials to Experiment type for Lab3D
  const lab3DExperiment: ExperimentType = {
    id: experiment.id,
    title: experiment.title,
    description: experiment.description,
    difficulty: (experiment.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
    duration: parseInt(experiment.duration) || 15,
    category: experiment.category,
    objectives: [
      'Complete the experiment successfully',
      'Observe chemical reactions',
      'Learn chemistry concepts'
    ],
    steps: materials.steps.map((step, idx) => ({
      id: `step${idx + 1}`,
      instruction: step,
      chemicals: [],
      equipment: ['beaker'],
      action: 'pour' as const,
      expectedObservation: 'Observe the reaction',
      completed: false
    })),
    materials: materials.equipment.map(eq => ({
      equipmentType: eq.type,
      quantity: 1,
      required: true
    })),
    chemicals: materials.chemicals.map(chem => ({
      id: chem.id,
      name: chem.name,
      formula: chem.formula,
      color: chem.color,
      concentration: 0.1,
      properties: {
        state: 'liquid' as const,
        color: chem.color,
        density: 1.0,
        boilingPoint: 100,
        meltingPoint: 0,
        solubility: 100,
        reactivity: []
      }
    })),
    safetyNotes: [
      'Wear safety goggles at all times',
      'Handle chemicals with care',
      'Work in a well-ventilated area'
    ],
    expectedResults: [
      'Successful completion of the experiment',
      'Observable chemical reactions'
    ],
    reactions: materials.reactions?.map((rule, idx) => ({
      id: `reaction${idx + 1}`,
      reactants: [],
      products: [],
      equation: '',
      conditions: { temperature: 25 },
      effects: [{
        type: 'color-change' as const,
        intensity: 0.8,
        duration: 3000
      }]
    })) || []
  };

  return (
    <Lab3D 
      experiment={lab3DExperiment} 
      onBack={() => navigate("/lab")}
    />
  );
};

export default Experiment;
