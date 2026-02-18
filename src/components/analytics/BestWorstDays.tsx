import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar } from "lucide-react";

interface Props {
  data: { day: string; rate: number; total: number }[];
}

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};
const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };

function getBarColor(rate: number, maxRate: number): string {
  if (rate === maxRate) return "hsl(152, 55%, 52%)";
  if (rate >= 70) return "hsl(180, 65%, 48%)";
  if (rate >= 40) return "hsl(38, 85%, 65%)";
  return "hsl(0, 72%, 55%)";
}

export default function BestWorstDays({ data }: Props) {
  const maxRate = Math.max(...data.map((d) => d.rate), 0);

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-chart-teal" />
          Best / Worst Days
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.some((d) => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} name="Completion %">
                {data.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.rate, maxRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
