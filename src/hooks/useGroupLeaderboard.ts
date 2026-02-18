import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGroupLeaderboard() {
  return useQuery({
    queryKey: ["group-leaderboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's groups
      const { data: memberships, error: mErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      if (mErr) throw mErr;
      if (!memberships || memberships.length === 0) return [];

      const groupIds = memberships.map((m) => m.group_id);

      // Get groups
      const { data: groups, error: gErr } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);
      if (gErr) throw gErr;

      // Get all members for these groups
      const { data: allMembers, error: amErr } = await supabase
        .from("group_members")
        .select("group_id, user_id")
        .in("group_id", groupIds);
      if (amErr) throw amErr;

      // Get gamification for all unique member user_ids
      const uniqueUserIds = [...new Set((allMembers || []).map((m) => m.user_id))];
      const { data: gamification, error: gaErr } = await supabase
        .from("user_gamification")
        .select("*")
        .in("user_id", uniqueUserIds);
      if (gaErr) throw gaErr;

      const gamMap = new Map((gamification || []).map((g) => [g.user_id, g]));

      // Aggregate per group
      const result = (groups || []).map((group) => {
        const memberUserIds = (allMembers || [])
          .filter((m) => m.group_id === group.id)
          .map((m) => m.user_id);
        const memberGam = memberUserIds
          .map((uid) => gamMap.get(uid))
          .filter(Boolean) as any[];
        const totalXP = memberGam.reduce((s, g) => s + (g.total_xp || 0), 0);
        const avgStreak = memberGam.length > 0
          ? Math.round(memberGam.reduce((s, g) => s + (g.current_streak || 0), 0) / memberGam.length)
          : 0;
        return {
          ...group,
          memberCount: memberUserIds.length,
          totalXP,
          avgStreak,
        };
      });

      return result.sort((a, b) => b.totalXP - a.totalXP).map((g, i) => ({ ...g, rank: i + 1 }));
    },
  });
}

export function useGroupMemberLeaderboard(groupId: string | null) {
  return useQuery({
    queryKey: ["group-member-leaderboard", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data: members, error: mErr } = await supabase
        .from("group_members")
        .select("user_id, role, profiles:user_id(display_name, avatar_url)")
        .eq("group_id", groupId!);
      if (mErr) throw mErr;
      if (!members || members.length === 0) return [];

      const userIds = members.map((m) => m.user_id);
      const { data: gamification, error: gErr } = await supabase
        .from("user_gamification")
        .select("*")
        .in("user_id", userIds);
      if (gErr) throw gErr;

      const gamMap = new Map((gamification || []).map((g) => [g.user_id, g]));

      return members
        .map((m: any) => ({
          user_id: m.user_id,
          role: m.role,
          display_name: m.profiles?.display_name || "Anonymous",
          avatar_url: m.profiles?.avatar_url,
          total_xp: gamMap.get(m.user_id)?.total_xp || 0,
          current_streak: gamMap.get(m.user_id)?.current_streak || 0,
          prestige_level: gamMap.get(m.user_id)?.prestige_level || "bronze",
        }))
        .sort((a, b) => b.total_xp - a.total_xp)
        .map((m, i) => ({ ...m, rank: i + 1 }));
    },
  });
}
