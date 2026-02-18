import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

interface Props {
  data: { tag: string; count: number }[];
}

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};
const AXIS_TICK = { fontSize: 10, fill: "hsl(220, 10%, 55%)" };

export default function FrictionAnalysis({ data }: Props) {
  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Top Friction Triggers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="tag" tick={AXIS_TICK} tickLine={false} axisLine={false} width={55} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="hsl(0, 72%, 55%)" radius={[0, 4, 4, 0]} name="Misses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No friction data recorded</p>
        )}
      </CardContent>
    </Card>
  );
}
