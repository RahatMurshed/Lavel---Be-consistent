import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { format, parseISO, getDay } from "date-fns";
import { useMemo } from "react";

interface Cell {
  date: string;
  rate: number; // -1 = no data
  count: number;
}

interface Props {
  data: Cell[];
}

function getCellColor(rate: number): string {
  if (rate === -1) return "hsl(200, 14%, 14%)";
  if (rate >= 90) return "hsl(152, 55%, 45%)";
  if (rate >= 70) return "hsl(152, 45%, 35%)";
  if (rate >= 50) return "hsl(38, 70%, 45%)";
  if (rate >= 25) return "hsl(20, 65%, 40%)";
  return "hsl(0, 55%, 35%)";
}

export default function StreakHeatmap({ data }: Props) {
  // Organize into weeks (columns), days (rows 0-6)
  const weeks = useMemo(() => {
    if (!data.length) return [];
    const result: Cell[][] = [];
    let currentWeek: Cell[] = [];
    // Pad start to align with day of week
    const firstDay = getDay(parseISO(data[0].date));
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: "", rate: -1, count: 0 });
    }
    data.forEach((cell) => {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [data]);

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-1">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Flame className="h-4 w-4 text-chart-emerald" />
          Streak Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-[2px] min-w-0">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className="w-[10px] h-[10px] rounded-[2px] transition-colors"
                      style={{ background: getCellColor(cell.rate) }}
                      title={cell.date ? `${format(parseISO(cell.date), "MMM d")}: ${cell.rate === -1 ? "No data" : `${cell.rate}%`}` : ""}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
              <span>Less</span>
              {[
                "hsl(200, 14%, 14%)",
                "hsl(0, 55%, 35%)",
                "hsl(38, 70%, 45%)",
                "hsl(152, 45%, 35%)",
                "hsl(152, 55%, 45%)",
              ].map((c, i) => (
                <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} />
              ))}
              <span>More</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No habit data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
