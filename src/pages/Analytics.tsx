import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentLogs } from "@/hooks/useHabits";
import { useSkills } from "@/hooks/useSkills";
import { useGamification } from "@/hooks/useGamification";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Flame, BookOpen, Zap } from "lucide-react";
import { format, subDays, subMonths, eachDayOfInterval, startOfDay } from "date-fns";

const PERIODS = [
  { key: "week", label: "7 Days", days: 7 },
  { key: "month", label: "30 Days", days: 30 },
  { key: "quarter", label: "90 Days", days: 90 },
  { key: "year", label: "365 Days", days: 365 },
] as const;

export default function Analytics() {
  const [period, setPeriod] = useState<string>("month");
  const days = PERIODS.find((p) => p.key === period)?.days || 30;
  const { data: logs } = useRecentLogs(days);
  const { data: skills } = useSkills();
  const { data: gamification } = useGamification();

  const completionData = useMemo(() => {
    if (!logs) return [];
    const end = new Date();
    const start = subDays(end, days - 1);
    const allDays = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
    
    return allDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.log_date === dateStr);
      const total = dayLogs.length || 1;
      const completed = dayLogs.filter((l) => l.status === "full" || l.status === "min").length;
      return {
        date: format(day, "MMM d"),
        rate: Math.round((completed / total) * 100),
        full: dayLogs.filter((l) => l.status === "full").length,
        min: dayLogs.filter((l) => l.status === "min").length,
        miss: dayLogs.filter((l) => l.status === "miss").length,
      };
    });
  }, [logs, days]);

  const totalCompleted = logs?.filter((l) => l.status === "full" || l.status === "min").length || 0;
  const totalFull = logs?.filter((l) => l.status === "full").length || 0;
  const avgRate = completionData.length > 0
    ? Math.round(completionData.reduce((s, d) => s + d.rate, 0) / completionData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${period === p.key ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: "Avg Completion", value: `${avgRate}%`, color: "text-primary" },
          { icon: Flame, label: "Habits Done", value: totalCompleted, color: "text-chart-teal" },
          { icon: BookOpen, label: "Skills Logged", value: skills?.length || 0, color: "text-chart-violet" },
          { icon: Zap, label: "Total XP", value: gamification?.total_xp || 0, color: "text-chart-amber" },
        ].map((s) => (
          <Card key={s.label} className="glass-card-premium hover-float">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Completion Rate Chart */}
      <Card className="glass-card-premium">
        <CardHeader>
          <CardTitle className="font-display text-lg">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={completionData}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(180, 65%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(180, 65%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(200, 18%, 10%)", border: "1px solid hsl(200, 14%, 22%)", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="rate" stroke="hsl(180, 65%, 48%)" fill="url(#rateGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Habits Breakdown */}
      <Card className="glass-card-premium">
        <CardHeader>
          <CardTitle className="font-display text-lg">Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completionData.slice(-14)}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(200, 18%, 10%)", border: "1px solid hsl(200, 14%, 22%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="full" fill="hsl(152, 55%, 52%)" radius={[4, 4, 0, 0]} stackId="a" name="Full" />
              <Bar dataKey="min" fill="hsl(38, 85%, 65%)" radius={[4, 4, 0, 0]} stackId="a" name="Min" />
              <Bar dataKey="miss" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} stackId="a" name="Miss" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
