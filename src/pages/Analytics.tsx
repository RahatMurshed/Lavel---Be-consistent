import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentLogs } from "@/hooks/useHabits";
import { useSkills } from "@/hooks/useSkills";
import { useGamification } from "@/hooks/useGamification";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  TrendingUp, Flame, BookOpen, Zap, Calendar, ArrowUpRight,
  ArrowDownRight, Target, BarChart3, Activity,
} from "lucide-react";
import {
  format, subDays, eachDayOfInterval, startOfDay, eachWeekOfInterval,
  eachMonthOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  isWithinInterval, parseISO,
} from "date-fns";

const PERIODS = [
  { key: "week", label: "Weekly", days: 7, bucketLabel: "Day" },
  { key: "month", label: "Monthly", days: 30, bucketLabel: "Day" },
  { key: "half", label: "Half-Year", days: 182, bucketLabel: "Week" },
  { key: "year", label: "Yearly", days: 365, bucketLabel: "Month" },
] as const;

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};

const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };

const PIE_COLORS = [
  "hsl(152, 55%, 52%)",
  "hsl(38, 85%, 65%)",
  "hsl(0, 72%, 55%)",
];

export default function Analytics() {
  const [period, setPeriod] = useState<string>("month");
  const periodConfig = PERIODS.find((p) => p.key === period) || PERIODS[1];
  const days = periodConfig.days;

  const { data: logs } = useRecentLogs(days);
  const { data: prevLogs } = useRecentLogs(days * 2); // for comparison
  const { data: skills } = useSkills();
  const { data: gamification } = useGamification();

  // --- Completion data bucketed by period ---
  const completionData = useMemo(() => {
    if (!logs) return [];
    const end = new Date();
    const start = subDays(end, days - 1);

    if (period === "week" || period === "month") {
      const allDays = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
      return allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayLogs = logs.filter((l) => l.log_date === dateStr);
        const total = dayLogs.length || 1;
        const completed = dayLogs.filter((l) => l.status === "full" || l.status === "min").length;
        return {
          date: format(day, period === "week" ? "EEE" : "MMM d"),
          rate: Math.round((completed / total) * 100),
          full: dayLogs.filter((l) => l.status === "full").length,
          min: dayLogs.filter((l) => l.status === "min").length,
          miss: dayLogs.filter((l) => l.status === "miss").length,
        };
      });
    }

    if (period === "half") {
      const weeks = eachWeekOfInterval({ start: startOfDay(start), end: startOfDay(end) });
      return weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart);
        const weekLogs = logs.filter((l) => {
          const d = parseISO(l.log_date);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        });
        const total = weekLogs.length || 1;
        const completed = weekLogs.filter((l) => l.status === "full" || l.status === "min").length;
        return {
          date: format(weekStart, "MMM d"),
          rate: Math.round((completed / total) * 100),
          full: weekLogs.filter((l) => l.status === "full").length,
          min: weekLogs.filter((l) => l.status === "min").length,
          miss: weekLogs.filter((l) => l.status === "miss").length,
        };
      });
    }

    // year -> monthly buckets
    const months = eachMonthOfInterval({ start: startOfDay(start), end: startOfDay(end) });
    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const monthLogs = logs.filter((l) => {
        const d = parseISO(l.log_date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });
      const total = monthLogs.length || 1;
      const completed = monthLogs.filter((l) => l.status === "full" || l.status === "min").length;
      return {
        date: format(monthStart, "MMM"),
        rate: Math.round((completed / total) * 100),
        full: monthLogs.filter((l) => l.status === "full").length,
        min: monthLogs.filter((l) => l.status === "min").length,
        miss: monthLogs.filter((l) => l.status === "miss").length,
      };
    });
  }, [logs, days, period]);

  // --- Stats ---
  const totalCompleted = logs?.filter((l) => l.status === "full" || l.status === "min").length || 0;
  const totalFull = logs?.filter((l) => l.status === "full").length || 0;
  const totalMin = logs?.filter((l) => l.status === "min").length || 0;
  const totalMiss = logs?.filter((l) => l.status === "miss").length || 0;
  const avgRate = completionData.length > 0
    ? Math.round(completionData.reduce((s, d) => s + d.rate, 0) / completionData.length)
    : 0;

  // --- Previous period comparison ---
  const prevPeriodStats = useMemo(() => {
    if (!prevLogs) return { avgRate: 0, completed: 0 };
    const end = subDays(new Date(), days);
    const start = subDays(end, days - 1);
    const periodLogs = prevLogs.filter((l) => {
      const d = parseISO(l.log_date);
      return isWithinInterval(d, { start: startOfDay(start), end: startOfDay(end) });
    });
    const completed = periodLogs.filter((l) => l.status === "full" || l.status === "min").length;
    const total = periodLogs.length || 1;
    return { avgRate: Math.round((completed / total) * 100), completed };
  }, [prevLogs, days]);

  const rateDelta = avgRate - prevPeriodStats.avgRate;
  const completedDelta = totalCompleted - prevPeriodStats.completed;

  // --- Skill growth by period ---
  const skillGrowth = useMemo(() => {
    if (!skills) return [];
    const end = new Date();
    const start = subDays(end, days - 1);

    if (period === "week" || period === "month") {
      const allDays = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
      let cumulative = 0;
      return allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const daySkills = skills.filter((s) => s.date_learned === dateStr).length;
        cumulative += daySkills;
        return { date: format(day, period === "week" ? "EEE" : "MMM d"), count: cumulative, new: daySkills };
      });
    }

    if (period === "half") {
      const weeks = eachWeekOfInterval({ start: startOfDay(start), end: startOfDay(end) });
      let cumulative = 0;
      return weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart);
        const weekSkills = skills.filter((s) => {
          const d = parseISO(s.date_learned);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        }).length;
        cumulative += weekSkills;
        return { date: format(weekStart, "MMM d"), count: cumulative, new: weekSkills };
      });
    }

    const months = eachMonthOfInterval({ start: startOfDay(start), end: startOfDay(end) });
    let cumulative = 0;
    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const monthSkills = skills.filter((s) => {
        const d = parseISO(s.date_learned);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      }).length;
      cumulative += monthSkills;
      return { date: format(monthStart, "MMM"), count: cumulative, new: monthSkills };
    });
  }, [skills, days, period]);

  // --- Pie data ---
  const pieData = [
    { name: "Full", value: totalFull },
    { name: "Min", value: totalMin },
    { name: "Miss", value: totalMiss },
  ].filter((d) => d.value > 0);

  const periodSkills = skills?.filter((s) => {
    const d = parseISO(s.date_learned);
    return isWithinInterval(d, { start: subDays(new Date(), days), end: new Date() });
  }).length || 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
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
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(subDays(new Date(), days - 1), "MMM d")} — {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>

      {/* Stats Grid */}
      <motion.div
        key={period}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          icon={TrendingUp}
          label="Avg Completion"
          value={`${avgRate}%`}
          color="text-primary"
          delta={rateDelta}
          deltaLabel="vs prev period"
        />
        <StatCard
          icon={Flame}
          label="Habits Done"
          value={totalCompleted}
          color="text-chart-teal"
          delta={completedDelta}
          deltaLabel="vs prev period"
        />
        <StatCard
          icon={BookOpen}
          label="Skills This Period"
          value={periodSkills}
          color="text-chart-violet"
        />
        <StatCard
          icon={Zap}
          label="Total XP"
          value={gamification?.total_xp || 0}
          color="text-chart-amber"
        />
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Completion Rate - 2 cols */}
        <Card className="glass-card-premium lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Completion Rate ({periodConfig.bucketLabel}ly)
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

        {/* Breakdown Pie */}
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
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[0] }} /> Full ({totalFull})
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[1] }} /> Min ({totalMin})
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[2] }} /> Miss ({totalMiss})
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-8">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Stacked Bar */}
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

        {/* Skill Growth Curve */}
        <Card className="glass-card-premium">
          <CardHeader className="pb-1">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-chart-violet" />
              Skill Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={skillGrowth}>
                <defs>
                  <linearGradient id="skillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(180, 60%, 55%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(180, 60%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="count" stroke="hsl(180, 60%, 55%)" strokeWidth={2} dot={false} name="Cumulative Skills" />
                <Area type="monotone" dataKey="count" fill="url(#skillGrad)" stroke="none" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- StatCard sub-component ---
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delta,
  deltaLabel,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <Card className="glass-card-premium hover-float">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${color} shrink-0`} />
          <div className="min-w-0">
            <p className={`text-xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        </div>
        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {delta >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-chart-emerald" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-destructive" />
            )}
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
