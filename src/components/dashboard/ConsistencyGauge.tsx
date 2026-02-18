import { useConsistencyScore } from "@/hooks/useConsistencyScore";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function scoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-chart-amber";
  return "text-destructive";
}

function strokeColor(score: number) {
  if (score >= 70) return "hsl(152, 55%, 52%)";
  if (score >= 40) return "hsl(38, 85%, 65%)";
  return "hsl(0, 72%, 55%)";
}

const DIMENSIONS_META: Record<string, string> = {
  Completion: "Percentage of habits logged as Full or Minimum.",
  Stability: "How consistent your daily completion rate is over time.",
  Recovery: "How fast you bounce back after a missed day.",
  Flexibility: "Your follow-through on low-energy days (≤4).",
  "Energy Align": "Your follow-through on high-energy days (≥7).",
};

export function ConsistencyGauge() {
  const score = useConsistencyScore();
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score.overall / 100) * circumference;

  const dimensions = [
    { label: "Completion", value: score.completionRatio },
    { label: "Stability", value: score.trendStability },
    { label: "Recovery", value: score.recoverySpeed },
    { label: "Flexibility", value: score.resilienceIndex },
    { label: "Energy Align", value: score.energyAlignment },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(228, 14%, 18%)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={strokeColor(score.overall)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-display font-bold ${scoreColor(score.overall)}`}>
              {score.overall}%
            </span>
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          {dimensions.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground w-24 flex items-center gap-1 cursor-help">
                    {d.label}
                    <Info className="w-3 h-3 opacity-50" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-52 text-xs">
                  {DIMENSIONS_META[d.label]}
                </TooltipContent>
              </Tooltip>
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${d.value}%` }}
                />
              </div>
              <span className="text-foreground w-8 text-right">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
