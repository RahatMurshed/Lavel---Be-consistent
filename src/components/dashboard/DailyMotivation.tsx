import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useConsistencyScore } from "@/hooks/useConsistencyScore";
import { useActiveHabits, useRecentLogs } from "@/hooks/useHabits";
import { useTodayCheckin } from "@/hooks/useDailyCheckin";
import { AUTH_QUOTES, getRandomQuote } from "@/lib/quotes";
import { format, subDays } from "date-fns";
import { useMemo } from "react";

function useUserContext() {
  const score = useConsistencyScore();
  const { data: habits } = useActiveHabits();
  const { data: checkin } = useTodayCheckin();
  const { data: logs } = useRecentLogs(60);

  const streak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const completed = new Set(
      logs.filter((l) => l.status === "full" || l.status === "min").map((l) => l.log_date)
    );
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (completed.has(d)) s++;
      else if (i > 0) break;
    }
    return s;
  }, [logs]);

  const burnoutRisk = useMemo(() => {
    if (!logs || logs.length < 5) return "Low";
    const byDate: Record<string, number[]> = {};
    logs.forEach((l) => {
      if (!byDate[l.log_date]) byDate[l.log_date] = [];
      byDate[l.log_date].push(l.status === "full" ? 1 : l.status === "min" ? 0.5 : 0);
    });
    const rates = Object.values(byDate).map((arr) => arr.reduce((s, v) => s + v, 0) / arr.length);
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    const variance = rates.reduce((s, r) => s + (r - avg) ** 2, 0) / rates.length;
    if (avg < 0.3 || variance > 0.15) return "High";
    if (avg < 0.5 || variance > 0.08) return "Medium";
    return "Low";
  }, [logs]);

  const recentMisses = useMemo(() => {
    if (!logs) return 0;
    const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
    return logs.filter((l) => l.status === "miss" && l.log_date >= weekAgo).length;
  }, [logs]);

  const identities = useMemo(() => {
    if (!habits) return [];
    const labels = new Set(habits.map((h) => (h as any).identities?.label).filter(Boolean));
    return Array.from(labels) as string[];
  }, [habits]);

  const hasData = logs && logs.length > 0;

  return {
    streak,
    completionRate: score.completionRatio,
    identities,
    burnoutRisk,
    energy: checkin?.energy,
    recentMisses,
    hasData,
  };
}

export function DailyMotivation() {
  const ctx = useUserContext();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["daily-motivation", todayStr],
    queryFn: async () => {
      if (!ctx.hasData) {
        const q = getRandomQuote(AUTH_QUOTES);
        return `"${q.text}" — ${q.author}`;
      }

      const { data: fnData, error } = await supabase.functions.invoke("motivational-quote", {
        body: {
          streak: ctx.streak,
          completionRate: ctx.completionRate,
          identities: ctx.identities,
          burnoutRisk: ctx.burnoutRisk,
          energy: ctx.energy,
          recentMisses: ctx.recentMisses,
        },
      });

      if (error || fnData?.error) {
        const q = getRandomQuote(AUTH_QUOTES);
        return `"${q.text}" — ${q.author}`;
      }

      return fnData.quote;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: ctx.hasData !== undefined,
  });

  return (
    <Card className="glass-card-premium overflow-hidden hover-float">
      <div className="h-0.5 bg-gradient-to-r from-primary via-chart-violet to-chart-blue animate-shimmer bg-[length:200%_100%]" />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <PremiumIcon icon={Sparkles} theme="violet" size="sm" animated />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
              Daily Motivation
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <p className="text-xs text-foreground/90 italic leading-relaxed">
                {data}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
