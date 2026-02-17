import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Sun } from "lucide-react";
import { useTodayCheckin, useSubmitCheckin } from "@/hooks/useDailyCheckin";
import { useActiveHabits } from "@/hooks/useHabits";
import { toast } from "sonner";

export function DashboardRight() {
  const { data: checkin, isLoading } = useTodayCheckin();
  const submitCheckin = useSubmitCheckin();
  const { data: habits } = useActiveHabits();
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);

  const handleCheckin = (energy: number) => {
    setSelectedEnergy(energy);
    submitCheckin.mutate(
      { energy },
      {
        onSuccess: () => toast.success(`Energy level ${energy} logged`),
        onError: () => toast.error("Failed to save check-in"),
      }
    );
  };

  // Simple micro-challenge from a random habit
  const randomHabit = habits && habits.length > 0
    ? habits[Math.floor(Math.random() * habits.length)]
    : null;

  const alreadyCheckedIn = !!checkin;

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
          {alreadyCheckedIn ? (
            <div className="text-center py-2">
              <p className="text-2xl font-display font-bold text-foreground">{checkin.energy}/10</p>
              <p className="text-xs text-muted-foreground mt-1">Energy logged for today</p>
              {checkin.energy <= 3 && (
                <p className="text-xs text-chart-amber mt-2">Low energy mode active — minimum versions shown</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">How's your energy today?</p>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleCheckin(i + 1)}
                    disabled={submitCheckin.isPending}
                    className={`flex-1 h-6 rounded-sm transition-colors text-[10px] ${
                      selectedEnergy === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 hover:bg-primary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
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
            {alreadyCheckedIn && checkin.energy >= 7
              ? "High energy today! Perfect time to tackle your most impactful habits at full intensity."
              : alreadyCheckedIn && checkin.energy <= 3
              ? "Low energy detected. Focus on minimum versions today — consistency beats intensity."
              : "Complete your morning check-in to receive personalized insights. More data = smarter coaching."}
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
          {randomHabit ? (
            <>
              <p className="text-sm text-foreground font-medium mb-2">
                "Do 2 minutes of: {randomHabit.min_version}"
              </p>
              <p className="text-[10px] text-muted-foreground">{randomHabit.name}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Add habits to unlock micro-challenges</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
