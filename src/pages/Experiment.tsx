import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChemistryLab } from "@/components/ChemistryLab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="relative w-full h-screen">
      <ChemistryLab />
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <Button
          onClick={() => navigate("/lab")}
          variant="outline"
          className="glass-panel holographic-border text-foreground hover:glow-cyan"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Button>

        <div className="glass-panel holographic-border px-6 py-3 text-center max-w-md">
          <h2 className="text-lg font-bold neon-text">{experiment.title}</h2>
          <p className="text-sm text-muted-foreground">{experiment.category} • {experiment.difficulty}</p>
        </div>

        <Button
          onClick={markAsComplete}
          className="glow-cyan holographic-border"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete
        </Button>
      </div>
    </div>
  );
};

export default Experiment;
