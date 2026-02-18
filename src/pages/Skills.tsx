import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSkills, useCreateSkill, useDeleteSkill, SKILL_CATEGORIES } from "@/hooks/useSkills";
import { useAwardXP } from "@/hooks/useGamification";
import { motion } from "framer-motion";
import { Plus, Trash2, BookOpen, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Skills() {
  const { data: skills, isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();
  const awardXP = useAwardXP();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createSkill.mutateAsync({ name: name.trim(), category, notes: notes.trim() || undefined });
    awardXP.mutate({ source: "skill_learned", xpAmount: 30 });
    toast.success(`+30 XP — Skill logged!`);
    setName(""); setNotes(""); setShowForm(false);
  };

  const filtered = filter === "all" ? skills : skills?.filter((s) => s.category === filter);
  const categoryCounts = skills?.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="glass-card-premium">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{skills?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Skills</p>
          </CardContent>
        </Card>
        {SKILL_CATEGORIES.slice(0, 3).map((cat) => (
          <Card key={cat.value} className="glass-card-premium">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold" style={{ color: cat.color }}>{categoryCounts[cat.value] || 0}</p>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === "all" ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"}`}
        >
          All
        </button>
        {SKILL_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === c.value ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"}`}
          >
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
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 group"
              >
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
                    <button
                      onClick={() => deleteSkill.mutate(skill.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
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
