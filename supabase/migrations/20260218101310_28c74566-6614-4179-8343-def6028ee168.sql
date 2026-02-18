
-- Group challenges table
CREATE TABLE public.group_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'habit_streak',
  target_value INTEGER NOT NULL DEFAULT 7,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  ai_generated BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view challenges"
ON public.group_challenges
FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Group members can create challenges"
ON public.group_challenges
FOR INSERT
WITH CHECK (public.is_group_member(auth.uid(), group_id) AND auth.uid() = created_by);

CREATE POLICY "Creator can update challenges"
ON public.group_challenges
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete challenges"
ON public.group_challenges
FOR DELETE
USING (auth.uid() = created_by);

-- Challenge participants / progress
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.group_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- Members can see all progress for challenges in their groups
CREATE POLICY "Group members can view progress"
ON public.challenge_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_challenges gc
    WHERE gc.id = challenge_id
    AND public.is_group_member(auth.uid(), gc.group_id)
  )
);

CREATE POLICY "Users can manage own progress"
ON public.challenge_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.challenge_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
ON public.challenge_progress
FOR DELETE
USING (auth.uid() = user_id);
