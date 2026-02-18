import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useConsistencyScore } from "@/hooks/useConsistencyScore";
import { useIdentityAlignment } from "@/hooks/useIdentityAlignment";
import { useRecentLogs, useWeekFriction, useActiveHabits } from "@/hooks/useHabits";
import { useTodayCheckin } from "@/hooks/useDailyCheckin";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  Target,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Rocket,
  Leaf,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { useMemo } from "react";

type CoachAnalysis = {
  overall_assessment: string;
  strength: string;
  focus_area: string;
  action_items: string[];
  mode_suggestion: "sprint" | "grace" | "maintenance" | "none";
  mode_reason: string;
  encouragement: string;
};

const MODE_CONFIG = {
  sprint: { icon: Rocket, label: "Sprint Mode", color: "text-success", bg: "bg-success/10", desc: "High intensity, maximize output" },
  grace: { icon: Leaf, label: "Grace Mode", color: "text-chart-amber", bg: "bg-chart-amber/10", desc: "Protect momentum, minimums count" },
  maintenance: { icon: Gauge, label: "Maintenance", color: "text-chart-blue", bg: "bg-chart-blue/10", desc: "Steady consistency, prevent burnout" },
  none: { icon: Target, label: "No Change", color: "text-muted-foreground", bg: "bg-secondary/10", desc: "Current mode is working" },
};

function useStreak() {
  const { data: logs } = useRecentLogs(60);
  return useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const completed = new Set(
      logs.filter((l) => l.status === "full" || l.status === "min").map((l) => l.log_date)
    );
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (completed.has(d)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [logs]);
}

function useBurnoutRisk() {
  const { data: logs } = useRecentLogs(14);
  return useMemo(() => {
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
}

export function ConsistencyCoach() {
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const score = useConsistencyScore();
  const { data: alignments } = useIdentityAlignment(7);
  const { data: recentLogs } = useRecentLogs(30);
  const { data: frictionTriggers } = useWeekFriction();
  const { data: habits } = useActiveHabits();
  const { data: checkin } = useTodayCheckin();
  const streak = useStreak();
  const burnoutRisk = useBurnoutRisk();

  const recentMisses = useMemo(() => {
    if (!recentLogs) return 0;
    const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
    return recentLogs.filter((l) => l.status === "miss" && l.log_date >= weekAgo).length;
  }, [recentLogs]);

  const habitPerformance = useMemo(() => {
    if (!habits || !recentLogs) return [];
    return habits.map((h) => {
      const logs = recentLogs.filter((l) => l.habit_id === h.id);
      const total = logs.length;
      const completed = logs.filter((l) => l.status === "full" || l.status === "min").length;
      return {
        name: h.name,
        completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [habits, recentLogs]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("consistency-coach", {
        body: {
          consistencyScore: score?.overall ?? null,
          completionRatio: score?.completionRatio ?? null,
          trendStability: score?.trendStability ?? null,
          recoverySpeed: score?.recoverySpeed ?? null,
          resilienceIndex: score?.resilienceIndex ?? null,
          energyAlignment: score?.energyAlignment ?? null,
          streak,
          burnoutRisk,
          energy: checkin?.energy,
          recentMisses,
          totalLogs: recentLogs?.length ?? 0,
          frictionTriggers: frictionTriggers ?? [],
          identities: alignments?.map((a) => ({
            label: a.label,
            alignmentPct: a.alignmentPct,
          })) ?? [],
          habitPerformance,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data.analysis);
      setHasRun(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to get coaching analysis");
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = analysis ? MODE_CONFIG[analysis.mode_suggestion] : null;

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <PremiumIcon icon={BrainCircuit} theme="violet" size="lg" animated />
            AI Consistency Coach
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deep behavioral analysis with personalized coaching
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          className="btn-gradient rounded-xl"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : hasRun ? (
            <RefreshCw className="h-4 w-4 mr-1" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          {loading ? "Analyzing..." : hasRun ? "Re-analyze" : "Run Analysis"}
        </Button>
      </div>

      {/* Pre-analysis state */}
      {!hasRun && !loading && (
        <Card className="glass-card-premium">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Ready to Analyze</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The AI Coach will analyze your consistency scores, friction patterns, identity alignment, and energy data to provide personalized coaching recommendations.
            </p>
            <Button onClick={runAnalysis} className="btn-gradient rounded-xl mt-2">
              <Sparkles className="h-4 w-4 mr-1" /> Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="glass-card-premium">
          <CardContent className="p-12 text-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Analyzing your behavioral patterns...</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Overall Assessment */}
            <Card className="glass-card-premium overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-chart-blue" />
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{analysis.overall_assessment}</p>
              </CardContent>
            </Card>

            {/* Strength & Focus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card-premium overflow-hidden h-full hover-float">
                  <div className="h-0.5 bg-gradient-to-r from-chart-teal to-chart-emerald" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-chart-teal" />
                      Your Strength
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">{analysis.strength}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <Card className="glass-card-premium overflow-hidden h-full hover-float">
                  <div className="h-0.5 bg-gradient-to-r from-chart-amber to-chart-rose" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-chart-amber" />
                      Focus Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">{analysis.focus_area}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Action Items */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card-premium overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-primary to-chart-violet" />
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.action_items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 border border-border/20"
                    >
                      <span className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground">{item}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Mode Suggestion */}
            {modeConfig && analysis.mode_suggestion !== "none" && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass-card-premium overflow-hidden hover-float">
                  <div className="h-0.5 bg-gradient-to-r from-chart-amber to-chart-teal" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-chart-amber" />
                      Seasonal Mode Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-10 w-10 rounded-xl ${modeConfig.bg} flex items-center justify-center`}>
                        <modeConfig.icon className={`h-5 w-5 ${modeConfig.color}`} />
                      </div>
                      <div>
                        <p className={`font-display font-semibold ${modeConfig.color}`}>{modeConfig.label}</p>
                        <p className="text-[10px] text-muted-foreground">{modeConfig.desc}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis.mode_reason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Encouragement */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="glass-card-premium overflow-hidden glow-primary">
                <div className="h-1 bg-gradient-to-r from-primary via-chart-blue to-chart-teal animate-shimmer bg-[length:200%_100%]" />
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium italic leading-relaxed">
                    "{analysis.encouragement}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
