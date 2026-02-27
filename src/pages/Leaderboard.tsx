import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useGroupLeaderboard } from "@/hooks/useGroupLeaderboard";
import { getPrestigeLevel } from "@/hooks/useGamification";
import { Trophy, Medal, Users, Flame, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { ProGateSkeleton } from "@/components/ProGateSkeleton";

const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export default function Leaderboard() {
  const { isPro, isLoading: subLoading } = useSubscription();
  const { data: individuals, isLoading: indLoading } = useLeaderboard();
  const { data: groupRankings, isLoading: grpLoading } = useGroupLeaderboard();

  if (subLoading) {
    return <ProGateSkeleton />;
  }

  if (!isPro) {
    return <UpgradePrompt feature="Leaderboard" />;
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Leaderboard</h1>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual" className="flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5" /> Individual
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <Card className="glass-card-premium">
            <CardHeader>
              <CardTitle className="font-display text-sm">Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              {indLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : !individuals || individuals.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No players on the leaderboard yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Opt in from your profile settings!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {individuals.map((player: any, i: number) => {
                    const prestige = getPrestigeLevel(player.total_xp || 0);
                    return (
                      <motion.div
                        key={player.user_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                          i < 3 ? "bg-primary/5" : "hover:bg-secondary/30"
                        }`}
                      >
                        <span className="w-6 text-center">
                          {i < 3 ? (
                            <Medal className={`h-4 w-4 mx-auto ${MEDAL_COLORS[i]}`} />
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground">{player.rank}</span>
                          )}
                        </span>
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {(player.display_name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{player.display_name}</p>
                          <span className="text-[10px] text-muted-foreground">{prestige.icon} {prestige.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="text-sm font-bold text-foreground">{(player.total_xp || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">XP</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-mono text-muted-foreground">{player.current_streak || 0}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card className="glass-card-premium">
            <CardHeader>
              <CardTitle className="font-display text-sm">Group Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {grpLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : !groupRankings || groupRankings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No groups to rank yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {groupRankings.map((group: any, i: number) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        i < 3 ? "bg-primary/5" : "hover:bg-secondary/30"
                      }`}
                    >
                      <span className="w-6 text-center">
                        {i < 3 ? (
                          <Medal className={`h-4 w-4 mx-auto ${MEDAL_COLORS[i]}`} />
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">{group.rank}</span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{group.name}</p>
                        <p className="text-[10px] text-muted-foreground">{group.memberCount} members</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-sm font-bold text-foreground">{group.totalXP.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Total XP</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-xs font-mono text-muted-foreground">{group.avgStreak}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
