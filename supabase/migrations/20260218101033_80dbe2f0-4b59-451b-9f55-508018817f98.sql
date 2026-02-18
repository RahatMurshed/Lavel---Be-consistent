
-- Learning milestones table
CREATE TABLE public.skill_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own milestones"
ON public.skill_milestones
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- AI skill recommendations cache table
CREATE TABLE public.skill_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own recommendations"
ON public.skill_recommendations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
