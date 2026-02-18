import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveHabits, useAllHabits, useRecentLogs } from "@/hooks/useHabits";
import { useSkills, SKILL_CATEGORIES } from "@/hooks/useSkills";
import { useIdentityAlignment } from "@/hooks/useIdentityAlignment";
import {
  useEnergyMoodTrends, useFrictionAnalysis,
  useLatestConsistencyScores, useBestWorstDays, useStreakHeatmapData,
} from "@/hooks/useAnalyticsData";
import ConsistencyRadar from "@/components/analytics/ConsistencyRadar";
import EnergyCorrelation from "@/components/analytics/EnergyCorrelation";
import FrictionAnalysis from "@/components/analytics/FrictionAnalysis";
import StreakHeatmap from "@/components/analytics/StreakHeatmap";
import IdentityPerformance from "@/components/analytics/IdentityPerformance";
import BestWorstDays from "@/components/analytics/BestWorstDays";
import AIInsights from "@/components/analytics/AIInsights";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  TrendingUp, Flame, BookOpen, Calendar, ArrowUpRight,
  ArrowDownRight, Target, BarChart3, Activity, Shield, Printer,
  Table as TableIcon,
} from "lucide-react";
import {
  format, subDays, eachDayOfInterval, startOfDay, eachWeekOfInterval,
  eachMonthOfInterval, endOfWeek, endOfMonth, isWithinInterval, parseISO,
} from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const PERIODS = [
  { key: "week", label: "Weekly", days: 7, bucketLabel: "Day" },
  { key: "month", label: "Monthly", days: 30, bucketLabel: "Day" },
  { key: "half", label: "Half-Year", days: 182, bucketLabel: "Week" },
  { key: "year", label: "Yearly", days: 365, bucketLabel: "Month" },
  { key: "all", label: "All-Time", days: 9999, bucketLabel: "Month" },
] as const;

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};
const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };
const PIE_COLORS = ["hsl(152, 55%, 52%)", "hsl(38, 85%, 65%)", "hsl(0, 72%, 55%)"];

export default function Analytics() {
  const [period, setPeriod] = useState<string>("month");
  const periodConfig = PERIODS.find((p) => p.key === period) || PERIODS[1];
  const days = periodConfig.days;
  const reportRef = useRef<HTMLDivElement>(null);

  // Core data
  const { data: logs } = useRecentLogs(days);
  const { data: prevLogs } = useRecentLogs(days * 2);
  const { data: skills } = useSkills();
  const { data: allHabits } = useAllHabits();

  // Analytics data
  const { data: checkins } = useEnergyMoodTrends(days);
  const { data: frictionData } = useFrictionAnalysis(days);
  const { data: consistencyScores } = useLatestConsistencyScores();
  const { data: identityAlignments } = useIdentityAlignment(days);
  const bestWorstDays = useBestWorstDays(logs);
  const heatmapData = useStreakHeatmapData(logs, days);

  // Completion bucketed data
  const completionData = useMemo(() => {
    if (!logs) return [];
    const end = new Date();
    const start = subDays(end, days - 1);
    const bucket = (dayLogs: any[]) => {
      const total = dayLogs.length || 1;
      const completed = dayLogs.filter((l) => l.status === "full" || l.status === "min").length;
      return {
        rate: Math.round((completed / total) * 100),
        full: dayLogs.filter((l) => l.status === "full").length,
        min: dayLogs.filter((l) => l.status === "min").length,
        miss: dayLogs.filter((l) => l.status === "miss").length,
      };
    };
    if (period === "week" || period === "month") {
      return eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) }).map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayLogs = logs.filter((l) => l.log_date === dateStr);
        return { date: format(day, period === "week" ? "EEE" : "MMM d"), ...bucket(dayLogs) };
      });
    }
    if (period === "half") {
      return eachWeekOfInterval({ start: startOfDay(start), end: startOfDay(end) }).map((ws) => {
        const we = endOfWeek(ws);
        const wLogs = logs.filter((l) => isWithinInterval(parseISO(l.log_date), { start: ws, end: we }));
        return { date: format(ws, "MMM d"), ...bucket(wLogs) };
      });
    }
    return eachMonthOfInterval({ start: startOfDay(start), end: startOfDay(end) }).map((ms) => {
      const me = endOfMonth(ms);
      const mLogs = logs.filter((l) => isWithinInterval(parseISO(l.log_date), { start: ms, end: me }));
      return { date: format(ms, "MMM"), ...bucket(mLogs) };
    });
  }, [logs, days, period]);

  // Stats
  const totalCompleted = logs?.filter((l) => l.status === "full" || l.status === "min").length || 0;
  const totalFull = logs?.filter((l) => l.status === "full").length || 0;
  const totalMin = logs?.filter((l) => l.status === "min").length || 0;
  const totalMiss = logs?.filter((l) => l.status === "miss").length || 0;
  const avgRate = completionData.length > 0
    ? Math.round(completionData.reduce((s, d) => s + d.rate, 0) / completionData.length)
    : 0;

  const prevPeriodStats = useMemo(() => {
    if (!prevLogs) return { avgRate: 0, completed: 0 };
    const end = subDays(new Date(), days);
    const start = subDays(end, days - 1);
    const pl = prevLogs.filter((l) => isWithinInterval(parseISO(l.log_date), { start: startOfDay(start), end: startOfDay(end) }));
    const completed = pl.filter((l) => l.status === "full" || l.status === "min").length;
    return { avgRate: Math.round((completed / (pl.length || 1)) * 100), completed };
  }, [prevLogs, days]);

  const rateDelta = avgRate - prevPeriodStats.avgRate;
  const completedDelta = totalCompleted - prevPeriodStats.completed;

  const pieData = [
    { name: "Full", value: totalFull },
    { name: "Min", value: totalMin },
    { name: "Miss", value: totalMiss },
  ].filter((d) => d.value > 0);

  const periodSkills = skills?.filter((s) => isWithinInterval(parseISO(s.date_learned), { start: subDays(new Date(), days), end: new Date() })).length || 0;

  // Streak from logs
  const currentStreak = useMemo(() => {
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

  const longestStreak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const dates = [...new Set(logs.filter(l => l.status === "full" || l.status === "min").map(l => l.log_date))].sort();
    let max = 0, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
      if (diff === 1) cur++;
      else cur = 1;
      if (cur > max) max = cur;
    }
    return Math.max(max, cur);
  }, [logs]);

  const overallConsistency = consistencyScores ? Number(consistencyScores.overall_score) : 0;
  const activeHabitCount = allHabits?.filter(h => h.active).length || 0;

  const bestDay = bestWorstDays.reduce((best, d) => d.rate > best.rate ? d : best, { day: "-", rate: 0, total: 0 });
  const worstDay = bestWorstDays.filter((d) => d.total > 0).reduce((worst, d) => d.rate < worst.rate ? d : worst, { day: "-", rate: 100, total: 0 });

  // Per-habit report data
  const habitReport = useMemo(() => {
    if (!allHabits || !logs) return [];
    return allHabits.map((habit) => {
      const habitLogs = logs.filter(l => l.habit_id === habit.id);
      const full = habitLogs.filter(l => l.status === "full").length;
      const min = habitLogs.filter(l => l.status === "min").length;
      const miss = habitLogs.filter(l => l.status === "miss").length;
      const total = full + min + miss;
      const completionPct = total > 0 ? Math.round(((full + min) / total) * 100) : 0;
      const identity = habit.identities;
      return {
        id: habit.id,
        name: habit.name,
        active: habit.active,
        identity: identity ? `${identity.emoji || ""} ${identity.label}` : "—",
        full,
        min,
        miss,
        total,
        completionPct,
      };
    }).sort((a, b) => b.total - a.total);
  }, [allHabits, logs]);

  return (
    <div className="space-y-6 print:space-y-4" ref={reportRef}>
      {/* Period Selector + Export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                period === p.key
                  ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {period === "all" ? "All Time" : `${format(subDays(new Date(), days - 1), "MMM d")} — ${format(new Date(), "MMM d, yyyy")}`}
          </span>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 print:hidden" onClick={() => window.print()}>
            <Printer className="h-3 w-3" /> Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard icon={TrendingUp} label="Avg Completion" value={`${avgRate}%`} color="text-primary" delta={rateDelta} deltaLabel="vs prev" />
        <StatCard icon={Flame} label="Current Streak" value={`${currentStreak}d`} color="text-chart-amber" subtext={`Best: ${longestStreak}d`} />
        <StatCard icon={Target} label="Active Habits" value={activeHabitCount} color="text-chart-teal" />
        <StatCard icon={Target} label="Habits Done" value={totalCompleted} color="text-chart-emerald" delta={completedDelta} deltaLabel="vs prev" />
        <StatCard icon={BookOpen} label="Skills Learned" value={periodSkills} color="text-chart-violet" />
        <StatCard icon={Shield} label="Consistency" value={overallConsistency} color="text-chart-teal" />
      </motion.div>

      {/* Completion Rate Chart */}
      <Card className="glass-card-premium">
        <CardHeader className="pb-1">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Completion Rate Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={completionData}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(180, 65%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(180, 65%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="rate" stroke="hsl(180, 65%, 48%)" fill="url(#rateGrad)" strokeWidth={2} name="Completion %" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Full Habit Report Table */}
      <Card className="glass-card-premium">
        <CardHeader className="pb-1">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-primary" />
            Habit Performance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {habitReport.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No habit data for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Habit</TableHead>
                  <TableHead className="text-xs">Identity</TableHead>
                  <TableHead className="text-xs text-center">Full</TableHead>
                  <TableHead className="text-xs text-center">Min</TableHead>
                  <TableHead className="text-xs text-center">Miss</TableHead>
                  <TableHead className="text-xs text-center">Total</TableHead>
                  <TableHead className="text-xs text-right">Completion %</TableHead>
                  <TableHead className="text-xs w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habitReport.map((h) => (
                  <TableRow key={h.id} className={!h.active ? "opacity-50" : ""}>
                    <TableCell className="text-xs font-medium">{h.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.identity}</TableCell>
                    <TableCell className="text-xs text-center text-chart-emerald">{h.full}</TableCell>
                    <TableCell className="text-xs text-center text-chart-amber">{h.min}</TableCell>
                    <TableCell className="text-xs text-center text-destructive">{h.miss}</TableCell>
                    <TableCell className="text-xs text-center">{h.total}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium">{h.completionPct}%</TableCell>
                    <TableCell>
                      <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            h.completionPct >= 80 ? "bg-chart-emerald" : h.completionPct >= 50 ? "bg-chart-amber" : "bg-destructive"
                          }`}
                          style={{ width: `${h.completionPct}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Full Skill Report Table */}
      <Card className="glass-card-premium">
        <CardHeader className="pb-1">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-chart-violet" />
            Skill Report
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!skills || skills.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No skills logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Skill Name</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Date Learned</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((s) => {
                  const catMeta = SKILL_CATEGORIES.find(c => c.value === s.category);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs font-medium">{s.name}</TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: catMeta?.color || "hsl(var(--muted))" }} />
                          {catMeta?.label || s.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(s.date_learned), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{s.notes || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Status Split Pie */}
        <Card className="glass-card-premium">
          <CardHeader className="pb-1">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-chart-teal" />
              Status Split
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[0] }} /> Full ({totalFull})</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[1] }} /> Min ({totalMin})</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[2] }} /> Miss ({totalMiss})</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Bucketed Breakdown */}
        <Card className="glass-card-premium">
          <CardHeader className="pb-1">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-amber" />
              {periodConfig.bucketLabel}ly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={completionData}>
                <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="full" fill="hsl(152, 55%, 52%)" radius={[2, 2, 0, 0]} stackId="a" name="Full" />
                <Bar dataKey="min" fill="hsl(38, 85%, 65%)" radius={[2, 2, 0, 0]} stackId="a" name="Min" />
                <Bar dataKey="miss" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} stackId="a" name="Miss" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Days + Consistency Radar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BestWorstDays data={bestWorstDays} />
        <ConsistencyRadar scores={consistencyScores || null} />
      </div>

      {/* Behavioral Intelligence */}
      <div className="grid lg:grid-cols-2 gap-4">
        <EnergyCorrelation checkins={checkins || []} logs={logs} />
        <FrictionAnalysis data={frictionData || []} />
      </div>

      {/* Identity Performance */}
      <IdentityPerformance alignments={identityAlignments || []} />

      {/* Streak Heatmap */}
      <StreakHeatmap data={heatmapData} />

      {/* AI Insights */}
      <AIInsights
        avgCompletion={avgRate}
        streak={currentStreak}
        bestDay={bestDay.day}
        worstDay={worstDay.day}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delta, deltaLabel, subtext }: {
  icon: any; label: string; value: string | number; color: string;
  delta?: number; deltaLabel?: string; subtext?: string;
}) {
  return (
    <Card className="glass-card-premium hover-float">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color} shrink-0`} />
          <div className="min-w-0">
            <p className={`text-lg font-display font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        </div>
        {subtext && <p className="text-[10px] text-muted-foreground mt-1">{subtext}</p>}
        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3 text-chart-emerald" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
            <span className={`text-[10px] font-medium ${delta >= 0 ? "text-chart-emerald" : "text-destructive"}`}>
              {delta > 0 ? "+" : ""}{delta}%
            </span>
            {deltaLabel && <span className="text-[10px] text-muted-foreground">{deltaLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
