import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import neutralizationImg from "@/assets/experiments/neutralization-reaction.jpg";
import precipitationImg from "@/assets/experiments/precipitation-reaction.jpg";
import displacementImg from "@/assets/experiments/displacement-reaction.jpg";
import combustionImg from "@/assets/experiments/combustion-reaction.jpg";
import decompositionImg from "@/assets/experiments/decomposition-reaction.jpg";
import acidBaseImg from "@/assets/experiments/acid-base-indicator.jpg";

interface Experiment {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  category: string;
  thumbnail_url: string | null;
}

interface UserProgress {
  experiment_id: string;
  progress_percentage: number;
  completed: boolean;
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/50",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  advanced: "bg-red-500/20 text-red-400 border-red-500/50",
};

export const CourseCatalog = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiments();
    fetchUserProgress();
  }, []);

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from("experiments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExperiments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load experiments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*");

      if (error) throw error;
      
      const progressMap = new Map();
      data?.forEach((progress) => {
        progressMap.set(progress.experiment_id, progress);
      });
      setUserProgress(progressMap);
    } catch (error: any) {
      console.error("Error fetching progress:", error);
    }
  };

  const categories = ["all", ...new Set(experiments.map((exp) => exp.category))];

  const filteredExperiments = selectedCategory === "all"
    ? experiments
    : experiments.filter((exp) => exp.category === selectedCategory);

  const handleStartExperiment = (experimentId: string) => {
    navigate(`/lab/experiment/${experimentId}`);
  };

  const getExperimentImage = (title: string) => {
    const imageMap: Record<string, string> = {
      'Neutralization Reaction': neutralizationImg,
      'Precipitation Reaction': precipitationImg,
      'Displacement Reaction': displacementImg,
      'Combustion Reaction': combustionImg,
      'Decomposition Reaction': decompositionImg,
      'Acid-Base Indicator Reaction': acidBaseImg,
    };
    return imageMap[title];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-foreground/60 animate-pulse">Loading experiments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold neon-text">Virtual Lab Experiments</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore interactive 3D experiments across chemistry, physics, and biology
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={selectedCategory === category ? "glow-cyan holographic-border" : "glass-panel"}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((experiment) => {
          const progress = userProgress.get(experiment.id);
          
          return (
            <Card
              key={experiment.id}
              className="glass-panel holographic-border hover:glow-cyan transition-all duration-300 overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                {getExperimentImage(experiment.title) ? (
                  <img
                    src={getExperimentImage(experiment.title)}
                    alt={experiment.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/50" />
                  </div>
                )}
                
                {/* Progress Overlay */}
                {progress && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/70">Progress</span>
                      <span className="text-primary font-bold">{progress.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className={difficultyColors[experiment.difficulty as keyof typeof difficultyColors]}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {experiment.difficulty}
                  </Badge>
                  <Badge variant="outline" className="glass-panel">
                    {experiment.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl neon-text">{experiment.title}</CardTitle>
                <CardDescription className="text-foreground/70">
                  {experiment.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{experiment.duration}</span>
                </div>
                <Button
                  onClick={() => handleStartExperiment(experiment.id)}
                  className="glow-cyan holographic-border"
                >
                  {progress?.completed ? "Review" : progress ? "Continue" : "Start"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredExperiments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No experiments found in this category</p>
        </div>
      )}
    </div>
  );
};
