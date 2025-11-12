-- Create experiments/courses table
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experiment_id)
);

-- Enable RLS
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Experiments are viewable by all authenticated users
CREATE POLICY "Experiments are viewable by authenticated users"
ON public.experiments
FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for experiments updated_at
CREATE TRIGGER update_experiments_updated_at
BEFORE UPDATE ON public.experiments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample experiments
INSERT INTO public.experiments (title, description, difficulty, duration, category, thumbnail_url) VALUES
('Chemistry Lab Basics', 'Learn fundamental chemistry concepts with interactive 3D molecular visualization and basic reactions.', 'beginner', '2 hours', 'Chemistry', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400'),
('Acid-Base Reactions', 'Explore pH levels, indicators, and neutralization reactions in this comprehensive experiment.', 'intermediate', '3 hours', 'Chemistry', 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400'),
('Organic Chemistry Synthesis', 'Advanced organic chemistry experiment covering synthesis pathways and molecular structures.', 'advanced', '4 hours', 'Chemistry', 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400'),
('Thermodynamics & Energy', 'Study heat transfer, energy conservation, and thermodynamic principles through virtual simulations.', 'intermediate', '2.5 hours', 'Physics', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'),
('Quantum Mechanics Intro', 'Introduction to quantum states, wave functions, and the uncertainty principle.', 'advanced', '5 hours', 'Physics', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400'),
('Cell Biology Basics', 'Explore cellular structures, organelles, and basic biological processes in 3D.', 'beginner', '2 hours', 'Biology', 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400');