
-- Add emoji column to identities
ALTER TABLE public.identities ADD COLUMN IF NOT EXISTS emoji text DEFAULT '🎯';

-- Add stress_level column to daily_checkins
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS stress_level integer;

-- Create consistency_scores table
CREATE TABLE public.consistency_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  score_date date NOT NULL DEFAULT CURRENT_DATE,
  overall_score numeric NOT NULL DEFAULT 0,
  completion_ratio numeric NOT NULL DEFAULT 0,
  trend_stability numeric NOT NULL DEFAULT 0,
  recovery_speed numeric NOT NULL DEFAULT 0,
  resilience_index numeric NOT NULL DEFAULT 0,
  energy_alignment numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

ALTER TABLE public.consistency_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own consistency scores"
  ON public.consistency_scores
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create weekly_reports table
CREATE TABLE public.weekly_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  report_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own weekly reports"
  ON public.weekly_reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
