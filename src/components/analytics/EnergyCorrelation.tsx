import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

interface Props {
  checkins: { checkin_date: string; energy: number; stress_level: number | null }[];
  logs: any[] | undefined;
}

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};
const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };

export default function EnergyCorrelation({ checkins, logs }: Props) {
  const data = useMemo(() => {
    if (!checkins.length) return [];
    // Build completion rate by date from logs
    const rateByDate: Record<string, { total: number; completed: number }> = {};
    (logs || []).forEach((l) => {
      if (!rateByDate[l.log_date]) rateByDate[l.log_date] = { total: 0, completed: 0 };
      rateByDate[l.log_date].total++;
      if (l.status === "full" || l.status === "min") rateByDate[l.log_date].completed++;
    });

    return checkins.map((c) => {
      const r = rateByDate[c.checkin_date];
      return {
        date: format(parseISO(c.checkin_date), "MMM d"),
        energy: c.energy,
        stress: c.stress_level ?? 0,
        completion: r ? Math.round((r.completed / r.total) * 100) : null,
      };
    });
  }, [checkins, logs]);

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-chart-rose" />
          Energy vs Completion
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 10]} />
              <YAxis yAxisId="right" orientation="right" tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line yAxisId="left" type="monotone" dataKey="energy" stroke="hsl(38, 85%, 65%)" strokeWidth={2} dot={false} name="Energy (1-10)" />
              <Line yAxisId="right" type="monotone" dataKey="completion" stroke="hsl(180, 65%, 48%)" strokeWidth={2} dot={false} name="Completion %" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No check-in data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
