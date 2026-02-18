import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, ShieldAlert, Check, Minus, X, Rocket, Leaf, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveHabits, useTodayLogs, useLogHabit, useRecentLogs } from "@/hooks/useHabits";
import { useConsistencyScore } from "@/hooks/useConsistencyScore";
import { useTodayCheckin } from "@/hooks/useDailyCheckin";
import { useActiveSeasonalMode, MODE_META } from "@/hooks/useSeasonalMode";
import { ConsistencyGauge } from "./ConsistencyGauge";
import { MomentumChart } from "./MomentumChart";
import { FrictionModal } from "./FrictionModal";
import { FrictionSummary } from "./FrictionSummary";
import TodoList from "./TodoList";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import { format, subDays } from "date-fns";
import { useMemo } from "react";
import { toast } from "sonner";
import { getRandomToast } from "@/lib/quotes";

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
      else continue;
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

const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.3 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export function DashboardCenter() {
  const { data: habits, isLoading: habitsLoading } = useActiveHabits();
  const { data: todayLogs } = useTodayLogs();
  const { data: checkin } = useTodayCheckin();
  const { data: seasonalMode } = useActiveSeasonalMode();
  const logHabit = useLogHabit();
  const score = useConsistencyScore();
  const streak = useStreak();
  const burnoutRisk = useBurnoutRisk();

  const currentMode = seasonalMode?.mode || null;
  const modeMeta = currentMode ? MODE_META[currentMode as keyof typeof MODE_META] : null;

  const [frictionModal, setFrictionModal] = useState<{ open: boolean; habitId: string; habitName: string }>({
    open: false, habitId: "", habitName: "",
  });

  const getLogStatus = (habitId: string) => todayLogs?.find((l) => l.habit_id === habitId)?.status;

  const handleLog = (habitId: string, habitName: string, status: string) => {
    if (status === "miss") {
      setFrictionModal({ open: true, habitId, habitName });
      return;
    }
    logHabit.mutate({ habitId, status }, {
      onSuccess: () => {
        toast.success(getRandomToast(status as "full" | "min"));
      },
    });
  };

  const handleFrictionSubmit = (tags: string[], notes: string) => {
    logHabit.mutate({
      habitId: frictionModal.habitId,
      status: "miss",
      frictionTrigger: tags.join(", "),
      notes,
    }, {
      onSuccess: () => toast.info(getRandomToast("miss")),
    });
  };

  const energy = checkin?.energy;
  const isLowEnergy = energy !== undefined && energy !== null && energy <= 3;
  const isHighEnergy = energy !== undefined && energy !== null && energy >= 7;

  const isGraceMode = currentMode === "grace";
  const isSprintMode = currentMode === "sprint";
  const showMinVersion = isGraceMode || (isLowEnergy && !isSprintMode);
  const showFullEmphasis = isSprintMode || (isHighEnergy && !isGraceMode);

  const burnoutColor = burnoutRisk === "High" ? "text-destructive" : burnoutRisk === "Medium" ? "text-chart-amber" : "text-success";

  const MODE_ICONS_MAP: Record<string, typeof Rocket> = { sprint: Rocket, grace: Leaf, maintenance: Gauge };

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Stats Row */}
      <motion.div initial="hidden" animate="show" variants={cardStagger} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <motion.div variants={cardFade} className="sm:col-span-3">
          <Card className="glass-card-premium glow-primary h-full">
            <CardContent className="p-4">
              <ConsistencyGauge />
            </CardContent>
          </Card>
        </motion.div>

        <div className="sm:col-span-2 flex flex-col gap-4">
          <motion.div variants={cardFade} className="flex-1">
            <Card className="glass-card-premium overflow-hidden hover-float h-full">
              <div className="h-0.5 bg-gradient-to-r from-chart-teal to-chart-emerald" />
              <CardContent className="p-4 flex items-center gap-4 h-full">
                <PremiumIcon icon={Flame} theme="teal" size="lg" animated />
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardFade} className="flex-1">
            <Card className="glass-card-premium overflow-hidden hover-float h-full">
              <div className="h-0.5 bg-gradient-to-r from-chart-amber to-chart-rose" />
              <CardContent className="p-4 flex items-center gap-4 h-full">
                <PremiumIcon icon={ShieldAlert} theme="amber" size="lg" />
                <div>
                  <p className={`text-2xl font-display font-bold ${burnoutColor}`}>{burnoutRisk}</p>
                  <p className="text-xs text-muted-foreground">Burnout Risk</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Momentum Curve */}
      <Card className="glass-card-premium">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Momentum Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MomentumChart />
        </CardContent>
      </Card>

      {/* Today's Habits */}
      <Card className="glass-card-premium">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Today's Habits
            {modeMeta && (
              <span className={`text-xs font-normal ${modeMeta.color} ${modeMeta.bgClass} px-2 py-0.5 rounded-full ml-2 flex items-center gap-1`}>
                {(() => { const MIcon = MODE_ICONS_MAP[currentMode!]; return MIcon ? <MIcon className="h-3 w-3" /> : null; })()}
                {modeMeta.label}
              </span>
            )}
            {!modeMeta && isLowEnergy && <span className="text-xs font-normal text-chart-amber bg-chart-amber/10 px-2 py-0.5 rounded-full ml-2">Low Energy Mode</span>}
            {!modeMeta && isHighEnergy && <span className="text-xs font-normal text-success bg-success/10 px-2 py-0.5 rounded-full ml-2">Full Power</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {habitsLoading ? (
            <p className="text-sm text-muted-foreground">Loading habits...</p>
          ) : !habits || habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active habits yet. Complete onboarding to get started.</p>
          ) : (
            habits.map((habit) => {
              const logged = getLogStatus(habit.id);
              const identity = habit.identities;
              return (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover-float ${
                    logged
                      ? "bg-secondary/10 border-border/20 opacity-60"
                      : "bg-secondary/20 border-border/30 hover:border-primary/30 hover:bg-secondary/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {identity?.emoji && <span className="text-sm">{identity.emoji}</span>}
                      <p className="text-sm font-medium text-foreground">{habit.name}</p>
                      {logged && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          logged === "full" ? "bg-success/20 text-success" : logged === "min" ? "bg-chart-amber/20 text-chart-amber" : "bg-destructive/20 text-destructive"
                        }`}>
                          {logged}
                        </span>
                      )}
                    </div>
                    {isGraceMode ? (
                      <div className="mt-0.5">
                        <p className="text-xs text-chart-amber font-medium">{habit.min_version}</p>
                        <p className="text-[10px] text-muted-foreground/50 line-through">{habit.full_version}</p>
                      </div>
                    ) : isSprintMode ? (
                      <div className="mt-0.5">
                        <p className="text-xs text-success font-medium">{habit.full_version}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {showMinVersion ? habit.min_version : habit.full_version}
                      </p>
                    )}
                    {identity && (
                      <p className="text-[10px] text-muted-foreground">{identity.label}</p>
                    )}
                  </div>
                  {!logged && (
                    <div className="flex gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleLog(habit.id, habit.name, "full")}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isGraceMode
                            ? "bg-secondary/30 text-muted-foreground hover:bg-success/20 hover:text-success"
                            : isSprintMode
                            ? "bg-success/20 text-success hover:bg-success/30 ring-1 ring-success/20"
                            : showMinVersion
                            ? "bg-secondary/30 text-muted-foreground hover:bg-success/20 hover:text-success"
                            : "bg-success/15 text-success hover:bg-success/25"
                        }`}
                      >
                        <Check className="h-3 w-3" /> Full
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleLog(habit.id, habit.name, "min")}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isGraceMode
                            ? "bg-chart-amber/20 text-chart-amber hover:bg-chart-amber/30 ring-1 ring-chart-amber/20"
                            : showMinVersion
                            ? "bg-chart-amber/15 text-chart-amber hover:bg-chart-amber/25 ring-1 ring-chart-amber/20"
                            : "bg-chart-amber/15 text-chart-amber hover:bg-chart-amber/25"
                        }`}
                      >
                        <Minus className="h-3 w-3" /> Min
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleLog(habit.id, habit.name, "miss")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive hover:bg-destructive/25 transition-all"
                      >
                        <X className="h-3 w-3" /> Miss
                      </motion.button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* To-Do List */}
      <TodoList />

      {/* Friction Summary */}
      <FrictionSummary />

      {/* Friction Modal */}
      <FrictionModal
        open={frictionModal.open}
        onClose={() => setFrictionModal((p) => ({ ...p, open: false }))}
        onSubmit={handleFrictionSubmit}
        habitName={frictionModal.habitName}
      />
    </main>
  );
}
