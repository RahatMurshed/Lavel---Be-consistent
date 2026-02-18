
-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can CRUD own gamification" ON public.user_gamification;

-- Profiles: allow self + leaderboard-opted-in users
CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR leaderboard_opt_in = true
  );

-- user_gamification: separate policies for each operation
CREATE POLICY "Users can insert own gamification"
  ON public.user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification"
  ON public.user_gamification FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gamification"
  ON public.user_gamification FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view gamification"
  ON public.user_gamification FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = user_gamification.user_id
      AND profiles.leaderboard_opt_in = true
    )
    OR EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = user_gamification.user_id
    )
  );
