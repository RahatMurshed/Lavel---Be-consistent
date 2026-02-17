import { useMemo } from "react";
import { useRecentLogs } from "@/hooks/useHabits";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, subDays, parseISO } from "date-fns";

export function MomentumChart() {
  const { data: logs } = useRecentLogs(14);

  const chartData = useMemo(() => {
    if (!logs) return [];
    const byDate: Record<string, { total: number; completed: number }> = {};

    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      byDate[d] = { total: 0, completed: 0 };
    }

    logs.forEach((l) => {
      if (byDate[l.log_date] !== undefined) {
        byDate[l.log_date].total++;
        if (l.status === "full" || l.status === "min") byDate[l.log_date].completed++;
      }
    });

    return Object.entries(byDate).map(([date, v]) => ({
      date: format(parseISO(date), "MMM d"),
      pct: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }));
  }, [logs]);

  if (chartData.every((d) => d.pct === 0)) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        Complete some habits to see your momentum curve
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={192}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(258, 62%, 63%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(258, 62%, 63%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(228, 16%, 12%)",
            border: "1px solid hsl(228, 14%, 22%)",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value}%`, "Completion"]}
        />
        <Area type="monotone" dataKey="pct" stroke="hsl(258, 62%, 63%)" fill="url(#momentumGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
