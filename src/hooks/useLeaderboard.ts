import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // Get users who opted in
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .eq("leaderboard_opt_in", true);
      if (pErr) throw pErr;
      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map((p) => p.user_id);
      const { data: gamification, error: gErr } = await supabase
        .from("user_gamification")
        .select("*")
        .in("user_id", userIds)
        .order("total_xp", { ascending: false });
      if (gErr) throw gErr;

      return (gamification || []).map((g, i) => {
        const profile = profiles.find((p) => p.user_id === g.user_id);
        return {
          rank: i + 1,
          ...g,
          display_name: profile?.display_name || "Anonymous",
          avatar_url: profile?.avatar_url,
        };
      });
    },
  });
}
