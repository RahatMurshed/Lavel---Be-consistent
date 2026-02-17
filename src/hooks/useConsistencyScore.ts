import { useMemo } from "react";
import { useRecentLogs } from "./useHabits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, differenceInCalendarDays, parseISO } from "date-fns";

function useRecentCheckins(days = 30) {
  return useQuery({
    queryKey: ["recent-checkins", days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const since = format(subDays(new Date(), days), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .gte("checkin_date", since);
      if (error) throw error;
      return data;
    },
  });
}

export function useConsistencyScore() {
  const { data: logs } = useRecentLogs(30);
  const { data: checkins } = useRecentCheckins(30);

  return useMemo(() => {
    if (!logs || logs.length === 0) {
      return { overall: 0, completionRatio: 0, trendStability: 0, recoverySpeed: 0, resilienceIndex: 0, energyAlignment: 0 };
    }

    // Group logs by date
    const byDate: Record<string, typeof logs> = {};
    logs.forEach((l) => {
      if (!byDate[l.log_date]) byDate[l.log_date] = [];
      byDate[l.log_date].push(l);
    });

    const dates = Object.keys(byDate).sort();
    const totalLogs = logs.length;
    const completed = logs.filter((l) => l.status === "full" || l.status === "min").length;

    // A: Completion Ratio (30%)
    const completionRatio = totalLogs > 0 ? (completed / totalLogs) * 100 : 0;

    // B: Trend Stability (25%) - inverse of daily variance
    const dailyRates = dates.map((d) => {
      const dayLogs = byDate[d];
      const dayCompleted = dayLogs.filter((l) => l.status === "full" || l.status === "min").length;
      return dayLogs.length > 0 ? dayCompleted / dayLogs.length : 0;
    });
    const avgRate = dailyRates.reduce((s, r) => s + r, 0) / (dailyRates.length || 1);
    const variance = dailyRates.reduce((s, r) => s + (r - avgRate) ** 2, 0) / (dailyRates.length || 1);
    const trendStability = Math.max(0, (1 - Math.sqrt(variance)) * 100);

    // C: Recovery Speed (20%) - avg days to return after a miss
    let recoveryDays: number[] = [];
    const sortedLogs = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
    for (let i = 0; i < sortedLogs.length; i++) {
      if (sortedLogs[i].status === "miss") {
        // Find next completion for same habit
        for (let j = i + 1; j < sortedLogs.length; j++) {
          if (sortedLogs[j].habit_id === sortedLogs[i].habit_id && (sortedLogs[j].status === "full" || sortedLogs[j].status === "min")) {
            recoveryDays.push(differenceInCalendarDays(parseISO(sortedLogs[j].log_date), parseISO(sortedLogs[i].log_date)));
            break;
          }
        }
      }
    }
    const avgRecovery = recoveryDays.length > 0 ? recoveryDays.reduce((s, d) => s + d, 0) / recoveryDays.length : 0;
    const recoverySpeed = Math.max(0, ((7 - Math.min(avgRecovery, 7)) / 7) * 100);

    // D: Resilience Index (15%) - completion on low energy days
    const checkinMap: Record<string, number> = {};
    checkins?.forEach((c) => { checkinMap[c.checkin_date] = c.energy; });
    const lowEnergyLogs = logs.filter((l) => checkinMap[l.log_date] !== undefined && checkinMap[l.log_date] <= 4);
    const lowEnergyCompleted = lowEnergyLogs.filter((l) => l.status === "full" || l.status === "min").length;
    const resilienceIndex = lowEnergyLogs.length > 0 ? (lowEnergyCompleted / lowEnergyLogs.length) * 100 : completionRatio;

    // E: Energy Alignment (10%) - completion on high energy days
    const highEnergyLogs = logs.filter((l) => checkinMap[l.log_date] !== undefined && checkinMap[l.log_date] >= 7);
    const highEnergyCompleted = highEnergyLogs.filter((l) => l.status === "full" || l.status === "min").length;
    const energyAlignment = highEnergyLogs.length > 0 ? (highEnergyCompleted / highEnergyLogs.length) * 100 : completionRatio;

    const overall =
      completionRatio * 0.3 +
      trendStability * 0.25 +
      recoverySpeed * 0.2 +
      resilienceIndex * 0.15 +
      energyAlignment * 0.1;

    return {
      overall: Math.round(overall),
      completionRatio: Math.round(completionRatio),
      trendStability: Math.round(trendStability),
      recoverySpeed: Math.round(recoverySpeed),
      resilienceIndex: Math.round(resilienceIndex),
      energyAlignment: Math.round(energyAlignment),
    };
  }, [logs, checkins]);
}
