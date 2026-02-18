import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Target } from "lucide-react";
import type { IdentityAlignment } from "@/hooks/useIdentityAlignment";

interface Props {
  alignments: IdentityAlignment[];
}

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};
const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };

export default function IdentityPerformance({ alignments }: Props) {
  const data = alignments
    .filter((a) => a.habitCount > 0)
    .map((a) => ({
      name: `${a.emoji || "🎯"} ${a.label}`,
      alignment: a.alignmentPct,
    }));

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-chart-blue" />
          Identity Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="alignment" fill="hsl(220, 65%, 58%)" radius={[4, 4, 0, 0]} name="Alignment %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No identity data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
