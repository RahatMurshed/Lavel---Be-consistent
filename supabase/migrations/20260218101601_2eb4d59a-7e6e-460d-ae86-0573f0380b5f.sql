
-- Identity drift alerts table
CREATE TABLE public.identity_drift_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  identity_id UUID REFERENCES public.identities(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'drift',
  severity TEXT NOT NULL DEFAULT 'warning',
  alignment_pct NUMERIC NOT NULL DEFAULT 0,
  previous_pct NUMERIC NOT NULL DEFAULT 0,
  corrective_plan JSONB,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.identity_drift_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own drift alerts"
ON public.identity_drift_alerts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
