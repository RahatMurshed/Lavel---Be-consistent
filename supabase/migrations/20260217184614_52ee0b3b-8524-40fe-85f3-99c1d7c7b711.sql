
-- Add unique constraints needed for upserts
CREATE UNIQUE INDEX IF NOT EXISTS behavior_logs_habit_log_date_idx ON public.behavior_logs (habit_id, log_date);
CREATE UNIQUE INDEX IF NOT EXISTS daily_checkins_user_date_idx ON public.daily_checkins (user_id, checkin_date);
