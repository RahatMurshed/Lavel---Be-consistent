import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useMyGroups, useCreateGroup, useJoinGroup, useGroupMembers } from "@/hooks/useGroups";
import {
  useGroupChallenges,
  useCreateChallenge,
  useJoinChallenge,
  useUpdateProgress,
  useChallengeLeaderboard,
  useTeamChallengeSuggestions,
  AISuggestion,
} from "@/hooks/useGroupChallenges";
import { useAwardXP } from "@/hooks/useGamification";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Copy, LogIn, X, Trophy, Swords, Sparkles,
  Loader2, Target, ArrowUp, Medal, ChevronDown, ChevronUp, Flame,
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  habit_streak: "Streak",
  skill_count: "Skills",
  xp_race: "XP Race",
  completion_rate: "Completion",
};

export default function Groups() {
  const { data: groups, isLoading } = useMyGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const createChallenge = useCreateChallenge();
  const joinChallenge = useJoinChallenge();
  const updateProgress = useUpdateProgress();
  const awardXP = useAwardXP();
  const { suggestions, isLoading: aiLoading, error: aiError, generate, setSuggestions } = useTeamChallengeSuggestions();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeTarget, setChallengeTarget] = useState(7);

  const { data: members } = useGroupMembers(selectedGroup);
  const { data: challenges } = useGroupChallenges(selectedGroup);
  const { data: leaderboard } = useChallengeLeaderboard(selectedChallenge);

  const selectedGroupData = groups?.find(g => g.id === selectedGroup);
  const activeChallenges = challenges?.filter(c => c.active) || [];
  const pastChallenges = challenges?.filter(c => !c.active) || [];

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await createGroup.mutateAsync({ name: name.trim(), description: desc.trim() || undefined });
    toast.success(`Group created! Code: ${group.invite_code}`);
    setName(""); setDesc(""); setShowCreate(false);
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    try {
      await joinGroup.mutateAsync(code.trim());
      toast.success("Joined group!");
      setCode(""); setShowJoin(false);
    } catch {
      toast.error("Invalid invite code");
    }
  };

  const handleCreateChallenge = async () => {
    if (!challengeTitle.trim() || !selectedGroup) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    await createChallenge.mutateAsync({
      group_id: selectedGroup,
      title: challengeTitle.trim(),
      description: challengeDesc.trim() || undefined,
      target_value: challengeTarget,
      end_date: endDate.toISOString().split("T")[0],
    });
    toast.success("Challenge created!");
    setChallengeTitle(""); setChallengeDesc(""); setShowChallengeForm(false);
  };

  const handleAcceptAISuggestion = async (suggestion: AISuggestion) => {
    if (!selectedGroup) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + suggestion.duration_days);
    await createChallenge.mutateAsync({
      group_id: selectedGroup,
      title: suggestion.title,
      description: suggestion.description,
      challenge_type: suggestion.challenge_type,
      target_value: suggestion.target_value,
      end_date: endDate.toISOString().split("T")[0],
      ai_generated: true,
    });
    awardXP.mutate({ source: "challenge_created", xpAmount: 10 });
    toast.success(`"${suggestion.title}" challenge started!`);
    setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!selectedGroup) return;
    await joinChallenge.mutateAsync({ challengeId, groupId: selectedGroup });
    toast.success("Joined challenge!");
  };

  const handleIncrementProgress = async (challengeId: string) => {
    const result = await updateProgress.mutateAsync({ challengeId, increment: 1 });
    if (result.completed) {
      awardXP.mutate({ source: "challenge_completed", xpAmount: 50 });
      toast.success("🏆 Challenge completed! +50 XP");
    } else {
      toast.success("+1 progress logged");
    }
  };

  const handleGenerateAI = () => {
    if (!selectedGroupData) return;
    generate(
      selectedGroupData.name,
      members?.length || 2,
      challenges || [],
    );
  };

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex gap-2">
        <Button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} className="btn-gradient" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Create Group
        </Button>
        <Button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} variant="outline" size="sm">
          <LogIn className="h-4 w-4 mr-1" /> Join Group
        </Button>
      </div>

      {showCreate && (
        <Card className="glass-card-premium">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Button onClick={handleCreate} disabled={!name.trim()} className="btn-gradient w-full">Create</Button>
          </CardContent>
        </Card>
      )}

      {showJoin && (
        <Card className="glass-card-premium">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Invite code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button onClick={handleJoin} disabled={!code.trim()} className="btn-gradient w-full">Join</Button>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !groups || groups.length === 0 ? (
        <Card className="glass-card-premium">
          <CardContent className="p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No groups yet. Create or join one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card
                className={`glass-card-premium hover-float cursor-pointer ${selectedGroup === group.id ? "ring-1 ring-primary/30" : ""}`}
                onClick={() => {
                  setSelectedGroup(selectedGroup === group.id ? null : group.id);
                  setSelectedChallenge(null);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{group.name}</p>
                      {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
                      <span className="text-[10px] text-muted-foreground">Role: {group.myRole}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(group.invite_code);
                        toast.success("Code copied!");
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-3 w-3" /> {group.invite_code}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Group Detail */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Members */}
            {members && (
              <Card className="glass-card-premium">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Members ({members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-1.5 bg-secondary/30 rounded-full px-2.5 py-1">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {(m.profiles?.display_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-foreground">{m.profiles?.display_name || "Anonymous"}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Challenge Suggestions */}
            <Card className="glass-card-premium shimmer-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Team Goals
                </CardTitle>
                <Button size="sm" onClick={handleGenerateAI} disabled={aiLoading} className="btn-gradient">
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  {suggestions.length > 0 ? "Refresh" : "Generate"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiError && <p className="text-xs text-destructive">{aiError}</p>}
                {suggestions.length === 0 && !aiLoading && !aiError && (
                  <p className="text-xs text-muted-foreground">Get AI-curated team challenges tailored to your group.</p>
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
                    <Button
                      size="sm"
                      className="btn-gradient shrink-0 h-7 text-xs"
                      onClick={() => handleAcceptAISuggestion(s)}
                    >
                      Start
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Challenges */}
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
                  <p className="text-xs text-muted-foreground py-2">No challenges yet. Create one or use AI suggestions!</p>
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
                                  <span className="text-[10px] text-muted-foreground">
                                    Target: {ch.target_value}
                                  </span>
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
                                  onJoin={() => handleJoinChallenge(ch.id)}
                                  onProgress={() => handleIncrementProgress(ch.id)}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}

                    {pastChallenges.length > 0 && (
                      <div className="pt-2 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Trophy className="h-3 w-3" /> Past Challenges</p>
                        {pastChallenges.slice(0, 3).map(ch => (
                          <div key={ch.id} className="text-xs text-muted-foreground py-0.5 line-through">{ch.title}</div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Challenge Leaderboard Sub-component ---

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
  const isParticipant = leaderboard?.some(async () => {
    // We'll check in render
    return false;
  });

  return (
    <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-2">
      {!leaderboard || leaderboard.length === 0 ? (
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground mb-2">No participants yet!</p>
          <Button size="sm" className="btn-gradient" onClick={onJoin}>
            <Flame className="h-3 w-3 mr-1" /> Join Challenge
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" /> Leaderboard
            </p>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-primary" onClick={onProgress}>
              <ArrowUp className="h-3 w-3 mr-0.5" /> Log +1
            </Button>
          </div>
          {leaderboard.map((entry, i) => {
            const pct = Math.min((entry.current_value / targetValue) * 100, 100);
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
            return (
              <div key={entry.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {medal && <span className="text-sm">{medal}</span>}
                    <span className="text-xs text-foreground">
                      {entry.profiles?.display_name || "Anonymous"}
                    </span>
                    {entry.completed && <Medal className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {entry.current_value}/{targetValue}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}

          <Button size="sm" variant="outline" className="w-full mt-1 text-xs" onClick={onJoin}>
            <Flame className="h-3 w-3 mr-1" /> Join Challenge
          </Button>
        </>
      )}
    </div>
  );
}
