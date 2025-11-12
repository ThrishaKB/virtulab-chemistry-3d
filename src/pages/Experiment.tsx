import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedLab } from "@/components/EnhancedLab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { experimentMaterials } from "@/config/experimentMaterials";

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
  const getExperimentKey = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('neutralization')) return 'neutralization';
    if (titleLower.includes('precipitation')) return 'precipitation';
    if (titleLower.includes('displacement')) return 'displacement';
    if (titleLower.includes('combustion')) return 'combustion';
    if (titleLower.includes('decomposition')) return 'decomposition';
    if (titleLower.includes('acid-base') || titleLower.includes('indicator')) return 'acid-base';
    return '';
  };

  const experimentKey = getExperimentKey(experiment.title);
  const materials = experimentMaterials[experimentKey];

  if (!materials) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-xl text-foreground/60">
          Experiment configuration not found for "{experiment.title}"
          <br />
          <span className="text-sm">Key attempted: {experimentKey}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <EnhancedLab experimentData={materials} />
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <Button
          onClick={() => navigate("/lab")}
          variant="outline"
          size="sm"
          className="glass-panel holographic-border text-foreground hover:glow-cyan"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Button
          onClick={markAsComplete}
          size="sm"
          className="glow-cyan holographic-border"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete
        </Button>
      </div>

      {/* Environment Info */}
      <div className="absolute top-4 right-[420px] z-50 glass-panel holographic-border p-3 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>🌡️</span>
          <span>25°C</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>⏱️</span>
          <span>0:00</span>
        </div>
      </div>
    </div>
  );
};

export default Experiment;
