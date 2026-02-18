import { useMemo } from "react";
import { useIdentities, useActiveHabits, useRecentLogs } from "./useHabits";

export interface IdentityAlignment {
  id: string;
  label: string;
  emoji: string | null;
  color: string | null;
  totalVotes: number;
  fullVotes: number;
  minVotes: number;
  missVotes: number;
  alignmentPct: number;
  habitCount: number;
  habits: {
    id: string;
    name: string;
    fullVotes: number;
    minVotes: number;
    missVotes: number;
    totalVotes: number;
    alignmentPct: number;
  }[];
}

export function useIdentityAlignment(days = 7) {
  const { data: identities, isLoading: idLoading } = useIdentities();
  const { data: habits, isLoading: habitsLoading } = useActiveHabits();
  const { data: logs, isLoading: logsLoading } = useRecentLogs(days);

  const alignments = useMemo<IdentityAlignment[]>(() => {
    if (!identities || !habits || !logs) return [];

    // Build log lookup: habitId -> { full, min, miss }
    const logsByHabit: Record<string, { full: number; min: number; miss: number }> = {};
    logs.forEach((log) => {
      if (!logsByHabit[log.habit_id]) logsByHabit[log.habit_id] = { full: 0, min: 0, miss: 0 };
      if (log.status === "full") logsByHabit[log.habit_id].full++;
      else if (log.status === "min") logsByHabit[log.habit_id].min++;
      else if (log.status === "miss") logsByHabit[log.habit_id].miss++;
    });

    return identities.map((identity) => {
      const identityHabits = habits.filter((h) => h.identity_id === identity.id);
      let totalFull = 0, totalMin = 0, totalMiss = 0;

      const habitDetails = identityHabits.map((h) => {
        const counts = logsByHabit[h.id] || { full: 0, min: 0, miss: 0 };
        totalFull += counts.full;
        totalMin += counts.min;
        totalMiss += counts.miss;
        const total = counts.full + counts.min + counts.miss;
        // Full = 1 vote, Min = 0.5 vote, Miss = 0
        const score = total > 0 ? ((counts.full + counts.min * 0.5) / total) * 100 : 0;
        return {
          id: h.id,
          name: h.name,
          fullVotes: counts.full,
          minVotes: counts.min,
          missVotes: counts.miss,
          totalVotes: total,
          alignmentPct: Math.round(score),
        };
      });

      const totalVotes = totalFull + totalMin + totalMiss;
      const alignmentPct = totalVotes > 0
        ? Math.round(((totalFull + totalMin * 0.5) / totalVotes) * 100)
        : 0;

      return {
        id: identity.id,
        label: identity.label,
        emoji: identity.emoji,
        color: identity.color,
        totalVotes,
        fullVotes: totalFull,
        minVotes: totalMin,
        missVotes: totalMiss,
        alignmentPct,
        habitCount: identityHabits.length,
        habits: habitDetails,
      };
    });
  }, [identities, habits, logs]);

  return {
    data: alignments,
    isLoading: idLoading || habitsLoading || logsLoading,
    totalVotes: alignments.reduce((s, a) => s + a.totalVotes, 0),
  };
}
