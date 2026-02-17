import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Sun } from "lucide-react";

export function DashboardRight() {
  return (
    <aside className="hidden lg:block w-80 border-l border-border/50 overflow-y-auto p-4 space-y-4">
      {/* Morning Check-in */}
      <Card className="glass-card border-chart-amber/20">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Sun className="h-4 w-4 text-chart-amber" />
            Morning Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">How's your energy today?</p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                className="flex-1 h-6 rounded-sm bg-secondary/50 hover:bg-primary/30 transition-colors text-[10px] text-muted-foreground hover:text-foreground"
              >
                {i + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Reflection */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Mirror
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your Builder identity is strengthening. Deep Work completion is up 15% this week.
            Consider adding a morning trigger to maintain momentum.
          </p>
        </CardContent>
      </Card>

      {/* Micro Challenge */}
      <Card className="glass-card border-chart-teal/20">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-chart-teal" />
            Micro Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground font-medium mb-2">
            "Write 3 sentences about your SaaS idea right now"
          </p>
          <button className="text-xs text-chart-teal hover:underline">
            Complete Challenge →
          </button>
        </CardContent>
      </Card>
    </aside>
  );
}
