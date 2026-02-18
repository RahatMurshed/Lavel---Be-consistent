import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupChallenges, useChallengeLeaderboard } from "@/hooks/useGroupChallenges";
import { useGroupMembers } from "@/hooks/useGroups";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target, Users, Trophy, TrendingUp } from "lucide-react";

export function GroupAnalytics({ groupId }: { groupId: string }) {
  const { data: challenges } = useGroupChallenges(groupId);
  const { data: members } = useGroupMembers(groupId);

  const totalChallenges = challenges?.length || 0;
  const activeChallenges = challenges?.filter((c) => c.active)?.length || 0;
  const completedChallenges = challenges?.filter((c) => !c.active)?.length || 0;
  const memberCount = members?.length || 0;

  // Build chart data from challenges
  const chartData = (challenges || []).slice(0, 8).map((ch) => ({
    name: ch.title.length > 12 ? ch.title.slice(0, 12) + "…" : ch.title,
    target: ch.target_value,
    active: ch.active,
  }));

  const stats = [
    { label: "Total Challenges", value: totalChallenges, icon: Target, color: "text-primary" },
    { label: "Active", value: activeChallenges, icon: TrendingUp, color: "text-green-500" },
    { label: "Completed", value: completedChallenges, icon: Trophy, color: "text-yellow-500" },
    { label: "Members", value: memberCount, icon: Users, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenge Targets Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm">Challenge Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="target" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
