import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSkills, useCreateSkill, useDeleteSkill, SKILL_CATEGORIES } from "@/hooks/useSkills";
import { useSkillMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from "@/hooks/useSkillMilestones";
import { useSkillRecommendations, SkillStack } from "@/hooks/useSkillRecommendations";
import { useAwardXP } from "@/hooks/useGamification";
import { useIdentityAlignment } from "@/hooks/useIdentityAlignment";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, X, Target, Sparkles, CheckCircle2, Loader2, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Skills() {
  const { data: skills, isLoading } = useSkills();
  const { data: milestones } = useSkillMilestones();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const awardXP = useAwardXP();
  const { data: identities } = useIdentityAlignment();
  const { stacks, isLoading: aiLoading, error: aiError, generate } = useSkillRecommendations();

  const [showForm, setShowForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneTarget, setMilestoneTarget] = useState(5);
  const [expandedStack, setExpandedStack] = useState<number | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createSkill.mutateAsync({ name: name.trim(), category, notes: notes.trim() || undefined });
    awardXP.mutate({ source: "skill_learned", xpAmount: 30 });
    toast.success(`+30 XP — Skill logged!`);
    setName(""); setNotes(""); setShowForm(false);
  };

  const handleCreateMilestone = async () => {
    if (!milestoneName.trim()) return;
    await createMilestone.mutateAsync({
      title: milestoneName.trim(),
      description: milestoneDesc.trim() || undefined,
      target_count: milestoneTarget,
    });
    toast.success("Milestone created!");
    setMilestoneName(""); setMilestoneDesc(""); setShowMilestoneForm(false);
  };

  const handleMilestoneProgress = (id: string, current: number, target: number) => {
    const next = Math.min(current + 1, target);
    const completed = next >= target;
    updateMilestone.mutate({ id, current_count: next, completed });
    if (completed) {
      awardXP.mutate({ source: "milestone_completed", xpAmount: 50 });
      toast.success("🏆 Milestone completed! +50 XP");
    }
  };

  const handleAddRecommendedSkill = async (skill: { name: string; category: string }) => {
    await createSkill.mutateAsync({ name: skill.name, category: skill.category });
    awardXP.mutate({ source: "skill_learned", xpAmount: 30 });
    toast.success(`+30 XP — "${skill.name}" added!`);
  };

  const handleGenerateRecommendations = () => {
    generate(skills || [], identities?.map(i => ({ label: i.label })) || []);
  };

  const filtered = filter === "all" ? skills : skills?.filter((s) => s.category === filter);
  const completedMilestones = milestones?.filter(m => m.completed) || [];
  const activeMilestones = milestones?.filter(m => !m.completed) || [];

  const categoryCounts = skills?.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="glass-card-premium">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{skills?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Skills</p>
          </CardContent>
        </Card>
        <Card className="glass-card-premium">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{completedMilestones.length}</p>
            <p className="text-xs text-muted-foreground">Milestones Hit</p>
          </CardContent>
        </Card>
        <Card className="glass-card-premium">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{Object.keys(categoryCounts).length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card className="glass-card-premium">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{activeMilestones.length}</p>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </CardContent>
        </Card>
      </div>

      {/* Milestones Section */}
      <Card className="glass-card-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Learning Milestones
          </CardTitle>
          <Button size="sm" onClick={() => setShowMilestoneForm(!showMilestoneForm)} variant={showMilestoneForm ? "ghost" : "default"} className={showMilestoneForm ? "" : "btn-gradient"}>
            {showMilestoneForm ? <X className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1" /> Add Milestone</>}
          </Button>
        </CardHeader>

        <AnimatePresence>
          {showMilestoneForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <CardContent className="space-y-3 border-t border-border/30 pt-4">
                <Input placeholder="Milestone title (e.g. Learn 5 technical skills)" value={milestoneName} onChange={(e) => setMilestoneName(e.target.value)} />
                <Textarea placeholder="Description (optional)" value={milestoneDesc} onChange={(e) => setMilestoneDesc(e.target.value)} rows={2} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <Input type="number" min={1} max={100} value={milestoneTarget} onChange={(e) => setMilestoneTarget(Number(e.target.value))} className="w-20" />
                </div>
                <Button onClick={handleCreateMilestone} disabled={!milestoneName.trim() || createMilestone.isPending} className="btn-gradient w-full">
                  Create Milestone
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="space-y-3">
          {activeMilestones.length === 0 && completedMilestones.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No milestones yet. Set learning goals to track progress!</p>
          ) : (
            <>
              {activeMilestones.map((m) => (
                <motion.div key={m.id} layout className="glass-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleMilestoneProgress(m.id, m.current_count, m.target_count)}>
                        +1
                      </Button>
                      <button onClick={() => deleteMilestone.mutate(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(m.current_count / m.target_count) * 100} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground font-mono">{m.current_count}/{m.target_count}</span>
                  </div>
                </motion.div>
              ))}
              {completedMilestones.length > 0 && (
                <div className="pt-2 border-t border-border/20">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Trophy className="h-3 w-3" /> Completed
                  </p>
                  {completedMilestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground line-through">{m.title}</span>
                      {m.completed_at && <span className="text-[10px] text-muted-foreground ml-auto">{format(new Date(m.completed_at), "MMM d")}</span>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Skill Stacks */}
      <Card className="glass-card-premium shimmer-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Skill Stacks
          </CardTitle>
          <Button size="sm" onClick={handleGenerateRecommendations} disabled={aiLoading} className="btn-gradient">
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            {stacks.length > 0 ? "Refresh" : "Generate"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiError && <p className="text-sm text-destructive">{aiError}</p>}
          {stacks.length === 0 && !aiLoading && !aiError && (
            <p className="text-sm text-muted-foreground">Get AI-powered skill stack recommendations based on your skills and identity goals.</p>
          )}
          {stacks.map((stack, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <button
                className="w-full text-left p-3 flex items-center justify-between hover:bg-secondary/20 transition-colors"
                onClick={() => setExpandedStack(expandedStack === i ? null : i)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stack.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{stack.theme}</p>
                    <p className="text-xs text-muted-foreground">{stack.description}</p>
                  </div>
                </div>
                {expandedStack === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {expandedStack === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-2">
                      {stack.skills.map((skill, j) => {
                        const alreadyAdded = skills?.some(s => s.name.toLowerCase() === skill.name.toLowerCase());
                        const catMeta = SKILL_CATEGORIES.find(c => c.value === skill.category);
                        return (
                          <div key={j} className="flex items-center justify-between gap-2 py-1">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: catMeta?.color || "hsl(var(--muted))" }} />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{skill.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{skill.reason}</p>
                              </div>
                            </div>
                            {alreadyAdded ? (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px] text-primary shrink-0"
                                onClick={() => handleAddRecommendedSkill(skill)}
                              >
                                <Plus className="h-3 w-3 mr-0.5" /> Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Add Skill */}
      <Card className="glass-card-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Skill Tracker
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "ghost" : "default"} className={showForm ? "" : "btn-gradient"}>
            {showForm ? <X className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1" /> Add Skill</>}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-3 border-t border-border/30 pt-4">
            <Input placeholder="Skill name..." value={name} onChange={(e) => setName(e.target.value)} />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            <Button onClick={handleCreate} disabled={!name.trim() || createSkill.isPending} className="btn-gradient w-full">
              Log Skill (+30 XP)
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === "all" ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"}`}>
          All
        </button>
        {SKILL_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setFilter(c.value)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === c.value ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !filtered || filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills logged yet.</p>
        ) : (
          filtered.map((skill, i) => {
            const catMeta = SKILL_CATEGORIES.find((c) => c.value === skill.category);
            return (
              <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 group">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full border-2" style={{ borderColor: catMeta?.color || "hsl(var(--muted))" }} />
                  {i < filtered.length - 1 && <div className="w-px flex-1 bg-border/30 min-h-[24px]" />}
                </div>
                <div className="flex-1 glass-card-premium p-3 hover-float">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{skill.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {catMeta?.label} · {format(new Date(skill.date_learned), "MMM d, yyyy")}
                      </p>
                    </div>
                    <button onClick={() => deleteSkill.mutate(skill.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {skill.notes && <p className="text-xs text-muted-foreground mt-1">{skill.notes}</p>}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
