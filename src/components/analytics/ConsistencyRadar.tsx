import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Shield } from "lucide-react";

interface Props {
  scores: {
    completion_ratio: number;
    trend_stability: number;
    recovery_speed: number;
    resilience_index: number;
    energy_alignment: number;
    overall_score: number;
  } | null;
}

const TOOLTIP_STYLE = {
  background: "hsl(200, 18%, 10%)",
  border: "1px solid hsl(200, 14%, 22%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(220, 20%, 92%)",
};

export default function ConsistencyRadar({ scores }: Props) {
  const data = scores
    ? [
        { metric: "Completion", value: Number(scores.completion_ratio) },
        { metric: "Stability", value: Number(scores.trend_stability) },
        { metric: "Recovery", value: Number(scores.recovery_speed) },
        { metric: "Resilience", value: Number(scores.resilience_index) },
        { metric: "Energy", value: Number(scores.energy_alignment) },
      ]
    : [];

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-chart-violet" />
          Consistency Radar
          {scores && (
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              Overall: {Number(scores.overall_score)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(200, 14%, 22%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="hsl(180, 65%, 48%)"
                fill="hsl(180, 65%, 48%)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground py-12 text-center">No consistency data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
