import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroupMembers } from "@/hooks/useGroups";
import {
  useGroupChallenges,
  useCreateChallenge,
  useJoinChallenge,
  useUpdateProgress,
  useChallengeLeaderboard,
  useTeamChallengeSuggestions,
  AISuggestion,
} from "@/hooks/useGroupChallenges";
import { GroupAnalytics } from "@/components/groups/GroupAnalytics";
import { GroupMemberLeaderboard } from "@/components/groups/GroupMemberLeaderboard";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Copy, Trophy, Swords, Sparkles, Loader2,
  Plus, X, Target, ArrowUp, Medal, ChevronDown, ChevronUp, Flame,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  habit_streak: "Streak",
  skill_count: "Skills",
  xp_race: "XP Race",
  completion_rate: "Completion",
};

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useGroupMembers(id || null);
  const { data: challenges } = useGroupChallenges(id || null);
  const createChallenge = useCreateChallenge();
  const joinChallenge = useJoinChallenge();
  const updateProgress = useUpdateProgress();
  const { suggestions, isLoading: aiLoading, error: aiError, generate, setSuggestions } = useTeamChallengeSuggestions();

  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeTarget, setChallengeTarget] = useState(7);

  const { data: leaderboard } = useChallengeLeaderboard(selectedChallenge);

  const activeChallenges = challenges?.filter((c) => c.active) || [];
  const pastChallenges = challenges?.filter((c) => !c.active) || [];

  if (groupLoading) return <p className="text-sm text-muted-foreground p-4">Loading...</p>;
  if (!group) return <p className="text-sm text-destructive p-4">Group not found.</p>;

  const handleCreateChallenge = async () => {
    if (!challengeTitle.trim() || !id) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    await createChallenge.mutateAsync({
      group_id: id,
      title: challengeTitle.trim(),
      description: challengeDesc.trim() || undefined,
      target_value: challengeTarget,
      end_date: endDate.toISOString().split("T")[0],
    });
    toast.success("Challenge created!");
    setChallengeTitle("");
    setChallengeDesc("");
    setShowChallengeForm(false);
  };

  const handleAcceptAISuggestion = async (suggestion: AISuggestion) => {
    if (!id) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + suggestion.duration_days);
    await createChallenge.mutateAsync({
      group_id: id,
      title: suggestion.title,
      description: suggestion.description,
      challenge_type: suggestion.challenge_type,
      target_value: suggestion.target_value,
      end_date: endDate.toISOString().split("T")[0],
      ai_generated: true,
    });
    toast.success(`"${suggestion.title}" challenge started!`);
    setSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/groups")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{group.name}</h1>
          {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(group.invite_code);
            toast.success("Invite code copied!");
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 rounded-full px-3 py-1.5"
        >
          <Copy className="h-3 w-3" /> {group.invite_code}
        </button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview"><Users className="h-3.5 w-3.5 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="challenges"><Swords className="h-3.5 w-3.5 mr-1" /> Challenges</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Analytics</TabsTrigger>
          <TabsTrigger value="leaderboard"><Trophy className="h-3.5 w-3.5 mr-1" /> Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Members */}
          <Card className="glass-card-premium">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Members ({members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {members?.map((m: any) => (
                <div key={m.id} className="flex items-center gap-1.5 bg-secondary/30 rounded-full px-2.5 py-1">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(m.profiles?.display_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-foreground">{m.profiles?.display_name || "Anonymous"}</span>
                  {m.role === "admin" && (
                    <span className="text-[9px] bg-primary/10 text-primary px-1 rounded">admin</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Challenges Preview */}
          <Card className="glass-card-premium">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" /> Active Challenges ({activeChallenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeChallenges.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active challenges.</p>
              ) : (
                <div className="space-y-2">
                  {activeChallenges.slice(0, 3).map((ch) => {
                    const daysLeft = differenceInDays(parseISO(ch.end_date), new Date());
                    return (
                      <div key={ch.id} className="glass-card p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{ch.title}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {CHALLENGE_TYPE_LABELS[ch.challenge_type] || ch.challenge_type} · Target: {ch.target_value} · {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
                          </span>
                        </div>
                        {ch.ai_generated && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          {/* AI Suggestions */}
          <Card className="glass-card-premium shimmer-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI Team Goals
              </CardTitle>
              <Button
                size="sm"
                onClick={() => generate(group.name, members?.length || 2, challenges || [])}
                disabled={aiLoading}
                className="btn-gradient"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                {suggestions.length > 0 ? "Refresh" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiError && <p className="text-xs text-destructive">{aiError}</p>}
              {suggestions.length === 0 && !aiLoading && !aiError && (
                <p className="text-xs text-muted-foreground">Get AI-curated team challenges.</p>
              )}
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-lg shrink-0">{s.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground">{s.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {CHALLENGE_TYPE_LABELS[s.challenge_type] || s.challenge_type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Target: {s.target_value} · {s.duration_days}d
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="btn-gradient shrink-0 h-7 text-xs" onClick={() => handleAcceptAISuggestion(s)}>
                    Start
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Challenge Management */}
          <Card className="glass-card-premium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" /> Challenges ({activeChallenges.length} active)
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowChallengeForm(!showChallengeForm)}
                variant={showChallengeForm ? "ghost" : "default"}
                className={showChallengeForm ? "" : "btn-gradient"}
              >
                {showChallengeForm ? <X className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1" /> New</>}
              </Button>
            </CardHeader>

            <AnimatePresence>
              {showChallengeForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <CardContent className="space-y-3 border-t border-border/30 pt-4">
                    <Input placeholder="Challenge title" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={challengeDesc} onChange={(e) => setChallengeDesc(e.target.value)} rows={2} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Target:</span>
                      <Input type="number" min={1} max={100} value={challengeTarget} onChange={(e) => setChallengeTarget(Number(e.target.value))} className="w-20" />
                    </div>
                    <Button onClick={handleCreateChallenge} disabled={!challengeTitle.trim()} className="btn-gradient w-full">
                      Create Challenge
                    </Button>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>

            <CardContent className="space-y-2">
              {activeChallenges.length === 0 && pastChallenges.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No challenges yet.</p>
              ) : (
                <>
                  {activeChallenges.map((ch) => {
                    const daysLeft = differenceInDays(parseISO(ch.end_date), new Date());
                    const isSelected = selectedChallenge === ch.id;
                    return (
                      <motion.div key={ch.id} layout className="glass-card overflow-hidden">
                        <button
                          className="w-full text-left p-3 flex items-center justify-between hover:bg-secondary/20 transition-colors"
                          onClick={() => setSelectedChallenge(isSelected ? null : ch.id)}
                        >
                          <div className="flex items-center gap-2">
                            {ch.ai_generated && <Sparkles className="h-3 w-3 text-primary shrink-0" />}
                            <div>
                              <p className="text-sm font-medium text-foreground">{ch.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  {CHALLENGE_TYPE_LABELS[ch.challenge_type] || ch.challenge_type}
                                </span>
                                <span className="text-[10px] text-muted-foreground">Target: {ch.target_value}</span>
                                <span className={`text-[10px] ${daysLeft <= 2 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                              <ChallengeLeaderboard
                                challengeId={ch.id}
                                targetValue={ch.target_value}
                                leaderboard={leaderboard}
                                onJoin={() => joinChallenge.mutateAsync({ challengeId: ch.id, groupId: id! }).then(() => toast.success("Joined!"))}
                                onProgress={() => updateProgress.mutateAsync({ challengeId: ch.id, increment: 1 }).then((r) => toast.success(r.completed ? "🏆 Completed!" : "+1 progress"))}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                  {pastChallenges.length > 0 && (
                    <div className="pt-2 border-t border-border/20">
                      <p className="text-xs text-muted-foreground mb-2">Past Challenges</p>
                      {pastChallenges.slice(0, 5).map((ch) => (
                        <div key={ch.id} className="flex items-center gap-2 py-1">
                          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">{ch.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <GroupAnalytics groupId={id!} />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <GroupMemberLeaderboard groupId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChallengeLeaderboard({
  challengeId,
  targetValue,
  leaderboard,
  onJoin,
  onProgress,
}: {
  challengeId: string;
  targetValue: number;
  leaderboard: any[] | undefined;
  onJoin: () => void;
  onProgress: () => void;
}) {
  if (!leaderboard) return <div className="px-3 pb-3 text-xs text-muted-foreground">Loading...</div>;

  return (
    <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-2">
      {leaderboard.length === 0 ? (
        <p className="text-xs text-muted-foreground">No participants yet.</p>
      ) : (
        leaderboard.map((p: any, i: number) => (
          <div key={p.id} className="flex items-center gap-2 py-1">
            <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}.</span>
            {i === 0 && <Medal className="h-3.5 w-3.5 text-yellow-500" />}
            <span className="text-xs flex-1 text-foreground">
              {(p.profiles as any)?.display_name || "Anonymous"}
            </span>
            <div className="flex items-center gap-2">
              <Progress value={(p.current_value / targetValue) * 100} className="h-1.5 w-16" />
              <span className="text-[10px] font-mono text-muted-foreground">{p.current_value}/{targetValue}</span>
            </div>
          </div>
        ))
      )}
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={onJoin} className="btn-gradient h-7 text-xs flex-1">Join</Button>
        <Button size="sm" onClick={onProgress} variant="outline" className="h-7 text-xs flex-1">
          <ArrowUp className="h-3 w-3 mr-1" /> Log Progress
        </Button>
      </div>
    </div>
  );
}
