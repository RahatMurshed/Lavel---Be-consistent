import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Flame, Target, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const mockHabits = [
  { name: "Deep Work (2h)", identity: "Builder", status: "pending" },
  { name: "Read 20 pages", identity: "Reader", status: "pending" },
  { name: "Exercise 30min", identity: "Athlete", status: "pending" },
];

export function DashboardCenter() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Consistency Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="glass-card glow-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">72%</p>
              <p className="text-xs text-muted-foreground">Consistency Score</p>
            </div>
            <TrendingUp className="h-4 w-4 text-success ml-auto" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-teal/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-chart-teal" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-amber/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-chart-amber" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">Low</p>
              <p className="text-xs text-muted-foreground">Burnout Risk</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Momentum Curve Placeholder */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Momentum Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Chart will render with real data
          </div>
        </CardContent>
      </Card>

      {/* Today's Habits */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Today's Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockHabits.map((habit) => (
            <div
              key={habit.name}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{habit.name}</p>
                <p className="text-xs text-muted-foreground">{habit.identity}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-md text-xs font-medium bg-success/20 text-success hover:bg-success/30 transition-colors">
                  Full ✓
                </button>
                <button className="px-3 py-1 rounded-md text-xs font-medium bg-chart-amber/20 text-chart-amber hover:bg-chart-amber/30 transition-colors">
                  Min ✓
                </button>
                <button className="px-3 py-1 rounded-md text-xs font-medium bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
                  Miss ✗
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
