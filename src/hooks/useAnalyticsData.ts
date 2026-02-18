import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { format, subDays, parseISO, getDay } from "date-fns";

export function useXPTimeline(days: number) {
  return useQuery({
    queryKey: ["xp-timeline", days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const since = format(subDays(new Date(), days), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("xp_events")
        .select("xp_amount, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at");
      if (error) throw error;
      // Build cumulative curve
      let cumulative = 0;
      const points = (data || []).map((e) => {
        cumulative += e.xp_amount;
        return {
          date: format(parseISO(e.created_at), "MMM d"),
          rawDate: e.created_at,
          xp: e.xp_amount,
          cumulative,
        };
      });
      return points;
    },
  });
}

export function useEnergyMoodTrends(days: number) {
  return useQuery({
    queryKey: ["energy-mood-trends", days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const since = format(subDays(new Date(), days), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("checkin_date, energy, mood, stress_level")
        .eq("user_id", user.id)
        .gte("checkin_date", since)
        .order("checkin_date");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useFrictionAnalysis(days: number) {
  return useQuery({
    queryKey: ["friction-analysis", days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const since = format(subDays(new Date(), days), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("behavior_logs")
        .select("friction_trigger")
        .eq("user_id", user.id)
        .eq("status", "miss")
        .gte("log_date", since)
        .not("friction_trigger", "is", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((log) => {
        if (log.friction_trigger) {
          log.friction_trigger.split(",").forEach((tag) => {
            const t = tag.trim();
            if (t) counts[t] = (counts[t] || 0) + 1;
          });
        }
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag, count]) => ({ tag, count }));
    },
  });
}

export function useLatestConsistencyScores() {
  return useQuery({
    queryKey: ["latest-consistency-scores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("consistency_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBestWorstDays(logs: any[] | undefined) {
  return useMemo(() => {
    if (!logs || logs.length === 0) return [];
    const dayStats: Record<number, { total: number; completed: number }> = {};
    for (let d = 0; d < 7; d++) dayStats[d] = { total: 0, completed: 0 };
    logs.forEach((l) => {
      const day = getDay(parseISO(l.log_date));
      dayStats[day].total++;
      if (l.status === "full" || l.status === "min") dayStats[day].completed++;
    });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames.map((name, i) => ({
      day: name,
      rate: dayStats[i].total > 0 ? Math.round((dayStats[i].completed / dayStats[i].total) * 100) : 0,
      total: dayStats[i].total,
    }));
  }, [logs]);
}

export function useStreakHeatmapData(logs: any[] | undefined, days: number) {
  return useMemo(() => {
    if (!logs) return [];
    const end = new Date();
    const heatmapDays = Math.min(days, 365);
    const cells: { date: string; rate: number; count: number }[] = [];
    for (let i = heatmapDays - 1; i >= 0; i--) {
      const d = subDays(end, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.log_date === dateStr);
      const total = dayLogs.length;
      const completed = dayLogs.filter((l) => l.status === "full" || l.status === "min").length;
      cells.push({
        date: dateStr,
        rate: total > 0 ? Math.round((completed / total) * 100) : -1,
        count: total,
      });
    }
    return cells;
  }, [logs, days]);
}
