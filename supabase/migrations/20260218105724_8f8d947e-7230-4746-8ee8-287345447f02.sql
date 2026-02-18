
ALTER TABLE public.todos ADD COLUMN priority TEXT NOT NULL DEFAULT 'important';
ALTER TABLE public.todos ADD COLUMN category TEXT;
