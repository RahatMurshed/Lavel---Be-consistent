import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { PrestigeBadge } from "@/components/dashboard/PrestigeBadge";
import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";

export default function Leaderboard() {
  const { data: entries, isLoading } = useLeaderboard();

  return (
    <div className="space-y-6">
      <Card className="glass-card-premium">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-chart-amber" /> Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !entries || entries.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No participants yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Opt in via your profile settings to appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    i === 0 ? "bg-chart-amber/10 border border-chart-amber/20" :
                    i === 1 ? "bg-secondary/20 border border-border/20" :
                    i === 2 ? "bg-chart-rose/5 border border-chart-rose/10" :
                    "bg-secondary/10 border border-border/10"
                  }`}
                >
                  <span className={`text-lg font-display font-bold w-8 text-center ${
                    i === 0 ? "text-chart-amber" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-chart-rose" : "text-muted-foreground/50"
                  }`}>
                    {entry.rank}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{entry.display_name}</p>
                    <div className="flex items-center gap-2">
                      <PrestigeBadge xp={entry.total_xp} />
                      <span className="text-[10px] text-muted-foreground">🔥 {entry.current_streak}d streak</span>
                    </div>
                  </div>
                  <span className="text-sm font-display font-bold text-primary">{entry.total_xp} XP</span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
