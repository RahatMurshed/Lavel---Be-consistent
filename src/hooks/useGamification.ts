import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRESTIGE_LEVELS = [
  { key: "bronze", label: "Bronze", minXP: 0, color: "from-amber-700 to-amber-500", icon: "🥉" },
  { key: "silver", label: "Silver", minXP: 500, color: "from-gray-400 to-gray-300", icon: "🥈" },
  { key: "gold", label: "Gold", minXP: 2000, color: "from-yellow-500 to-amber-400", icon: "🥇" },
  { key: "platinum", label: "Platinum", minXP: 5000, color: "from-cyan-400 to-blue-400", icon: "💎" },
  { key: "diamond", label: "Diamond", minXP: 15000, color: "from-violet-400 to-purple-500", icon: "👑" },
] as const;

export function getPrestigeLevel(xp: number) {
  for (let i = PRESTIGE_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= PRESTIGE_LEVELS[i].minXP) return PRESTIGE_LEVELS[i];
  }
  return PRESTIGE_LEVELS[0];
}

export function getNextLevel(xp: number) {
  const current = getPrestigeLevel(xp);
  const idx = PRESTIGE_LEVELS.findIndex((l) => l.key === current.key);
  return idx < PRESTIGE_LEVELS.length - 1 ? PRESTIGE_LEVELS[idx + 1] : null;
}

export function useGamification() {
  return useQuery({
    queryKey: ["gamification"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data || { total_xp: 0, prestige_level: "bronze", current_streak: 0, longest_streak: 0 };
    },
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAwardXP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ source, xpAmount }: { source: string; xpAmount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Log XP event
      await supabase.from("xp_events").insert({
        user_id: user.id,
        source,
        xp_amount: xpAmount,
      });

      // Upsert gamification record
      const { data: existing } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const newXP = (existing?.total_xp || 0) + xpAmount;
      const newLevel = getPrestigeLevel(newXP).key;

      if (existing) {
        await supabase
          .from("user_gamification")
          .update({ total_xp: newXP, prestige_level: newLevel })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("user_gamification")
          .insert({ user_id: user.id, total_xp: newXP, prestige_level: newLevel });
      }

      return { newXP, newLevel, previousLevel: existing?.prestige_level || "bronze" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}
