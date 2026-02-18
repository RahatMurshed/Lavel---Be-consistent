import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGroupMemberLeaderboard } from "@/hooks/useGroupLeaderboard";
import { getPrestigeLevel } from "@/hooks/useGamification";
import { Medal, Flame, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export function GroupMemberLeaderboard({ groupId }: { groupId: string }) {
  const { data: members, isLoading } = useGroupMemberLeaderboard(groupId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (!members || members.length === 0) {
    return (
      <Card className="glass-card-premium">
        <CardContent className="p-8 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No member data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-premium">
      <CardHeader>
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" /> Member Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {members.map((m: any, i: number) => {
          const prestige = getPrestigeLevel(m.total_xp || 0);
          return (
            <motion.div
              key={m.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${
                i < 3 ? "bg-primary/5" : "hover:bg-secondary/30"
              }`}
            >
              <span className="w-6 text-center">
                {i < 3 ? (
                  <Medal className={`h-4 w-4 mx-auto ${MEDAL_COLORS[i]}`} />
                ) : (
                  <span className="text-xs font-mono text-muted-foreground">{m.rank}</span>
                )}
              </span>
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                  {m.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.display_name}</p>
                <span className="text-[10px] text-muted-foreground">{prestige.icon} {prestige.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{m.total_xp.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs font-mono text-muted-foreground">{m.current_streak}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
