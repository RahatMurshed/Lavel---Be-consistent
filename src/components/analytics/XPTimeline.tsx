import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Zap } from "lucide-react";
import { PRESTIGE_LEVELS } from "@/hooks/useGamification";

interface Props {
  data: { date: string; cumulative: number; xp: number }[];
}

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};
const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };

export default function XPTimeline({ data }: Props) {
  const maxXP = data.length > 0 ? data[data.length - 1].cumulative : 0;

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-chart-amber" />
          XP Accumulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 85%, 65%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 85%, 65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              {PRESTIGE_LEVELS.filter((l) => l.minXP > 0 && l.minXP <= maxXP * 1.5).map((level) => (
                <ReferenceLine
                  key={level.key}
                  y={level.minXP}
                  stroke="hsl(220, 10%, 35%)"
                  strokeDasharray="4 4"
                  label={{ value: `${level.icon} ${level.label}`, position: "right", fontSize: 9, fill: "hsl(220, 10%, 55%)" }}
                />
              ))}
              <Area type="monotone" dataKey="cumulative" stroke="hsl(38, 85%, 65%)" fill="url(#xpGrad)" strokeWidth={2} name="Total XP" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground py-12 text-center">No XP events yet</p>
        )}
      </CardContent>
    </Card>
  );
}
