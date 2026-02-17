import { useWeekFriction } from "@/hooks/useHabits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function FrictionSummary() {
  const { data: friction } = useWeekFriction();

  if (!friction || friction.length === 0) return null;

  const max = friction[0]?.count || 1;

  return (
    <Card className="glass-card border-chart-rose/20">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-chart-rose" />
          Top Friction This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {friction.slice(0, 4).map((f) => (
          <div key={f.tag} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-28 truncate">{f.tag}</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-chart-rose/60 transition-all"
                style={{ width: `${(f.count / max) * 100}%` }}
              />
            </div>
            <span className="text-foreground w-4 text-right">{f.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
