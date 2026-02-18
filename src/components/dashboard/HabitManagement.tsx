import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllHabits, useIdentities, useUpdateHabit, useCreateHabit } from "@/hooks/useHabits";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import { Wrench, Plus, Save, X, Pencil, Archive, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const IDENTITY_GRADIENTS: Record<string, string> = {
  violet: "from-[hsl(258,62%,63%)] to-[hsl(215,70%,62%)]",
  teal: "from-[hsl(172,50%,55%)] to-[hsl(152,55%,52%)]",
  amber: "from-[hsl(38,85%,65%)] to-[hsl(350,65%,65%)]",
  rose: "from-[hsl(350,65%,65%)] to-[hsl(258,62%,63%)]",
  blue: "from-[hsl(215,70%,62%)] to-[hsl(172,50%,55%)]",
  emerald: "from-[hsl(152,55%,52%)] to-[hsl(172,50%,55%)]",
};

type HabitForm = {
  name: string;
  full_version: string;
  min_version: string;
  cue_trigger: string;
  identity_id: string;
};

const emptyForm: HabitForm = { name: "", full_version: "", min_version: "", cue_trigger: "", identity_id: "" };

const cardFade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HabitManagement() {
  const { data: habits, isLoading: habitsLoading } = useAllHabits();
  const { data: identities } = useIdentities();
  const updateHabit = useUpdateHabit();
  const createHabit = useCreateHabit();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<HabitForm>(emptyForm);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<HabitForm>(emptyForm);
  const [showArchived, setShowArchived] = useState(false);

  const activeHabits = habits?.filter((h) => h.active) || [];
  const archivedHabits = habits?.filter((h) => !h.active) || [];

  const startEdit = (habit: any) => {
    setEditingId(habit.id);
    setEditForm({
      name: habit.name,
      full_version: habit.full_version,
      min_version: habit.min_version,
      cue_trigger: habit.cue_trigger || "",
      identity_id: habit.identity_id || "",
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateHabit.mutate(
      {
        id: editingId,
        updates: {
          name: editForm.name,
          full_version: editForm.full_version,
          min_version: editForm.min_version,
          cue_trigger: editForm.cue_trigger || null,
          identity_id: editForm.identity_id || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Habit updated");
          setEditingId(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const toggleArchive = (id: string, currentActive: boolean) => {
    updateHabit.mutate(
      { id, updates: { active: !currentActive } },
      {
        onSuccess: () => toast.success(currentActive ? "Habit archived" : "Habit restored"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleAdd = () => {
    if (!addForm.name || !addForm.full_version || !addForm.min_version) {
      toast.error("Name, Full version, and Min version are required");
      return;
    }
    createHabit.mutate(
      {
        name: addForm.name,
        full_version: addForm.full_version,
        min_version: addForm.min_version,
        cue_trigger: addForm.cue_trigger || undefined,
        identity_id: addForm.identity_id || null,
      },
      {
        onSuccess: () => {
          toast.success("Habit created");
          setShowAdd(false);
          setAddForm(emptyForm);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const renderFormFields = (form: HabitForm, setForm: (f: HabitForm) => void) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Name</label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Morning Workout" className="bg-secondary/50 border-border/50" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            <span className="text-success">Full</span> version
          </label>
          <Input value={form.full_version} onChange={(e) => setForm({ ...form, full_version: e.target.value })} placeholder="e.g., 45 min gym session" className="bg-secondary/50 border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            <span className="text-chart-amber">Min</span> version
          </label>
          <Input value={form.min_version} onChange={(e) => setForm({ ...form, min_version: e.target.value })} placeholder="e.g., 10 pushups" className="bg-secondary/50 border-border/50" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Cue / Trigger</label>
        <Input value={form.cue_trigger} onChange={(e) => setForm({ ...form, cue_trigger: e.target.value })} placeholder="e.g., After morning coffee" className="bg-secondary/50 border-border/50" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Identity</label>
        <Select value={form.identity_id} onValueChange={(v) => setForm({ ...form, identity_id: v })}>
          <SelectTrigger className="bg-secondary/50 border-border/50">
            <SelectValue placeholder="Link to identity..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No identity</SelectItem>
            {identities?.map((id) => (
              <SelectItem key={id.id} value={id.id}>
                {id.emoji} {id.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (habitsLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-secondary/20 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <PremiumIcon icon={Wrench} theme="teal" size="lg" animated />
            Habit OS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit, edit, and manage your habit stack
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="btn-gradient rounded-xl">
          <Plus className="h-4 w-4 mr-1" /> Add Habit
        </Button>
      </div>

      {/* Active Habits */}
      <div>
        <h2 className="font-display text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Active Habits ({activeHabits.length})
        </h2>
        {activeHabits.length === 0 ? (
          <Card className="glass-card-premium">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No active habits. Add one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            className="space-y-3"
          >
            {activeHabits.map((habit) => {
              const identity = habit.identities;
              const gradient = IDENTITY_GRADIENTS[identity?.color || "violet"] || IDENTITY_GRADIENTS.violet;
              const isEditing = editingId === habit.id;

              return (
                <motion.div key={habit.id} variants={cardFade}>
                  <Card className="glass-card-premium overflow-hidden hover-float">
                    {identity && <div className={`h-0.5 bg-gradient-to-r ${gradient}`} />}
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          {renderFormFields(editForm, setEditForm)}
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={saveEdit} disabled={updateHabit.isPending} className="btn-gradient rounded-lg">
                              <Save className="h-3 w-3 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {identity && (
                                <div className={`h-5 w-5 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center text-[10px]`}>
                                  {identity.emoji || identity.label.charAt(0)}
                                </div>
                              )}
                              <p className="font-medium text-foreground">{habit.name}</p>
                            </div>
                            <div className="mt-1.5 space-y-0.5">
                              <p className="text-xs">
                                <span className="text-success font-medium">Full:</span>{" "}
                                <span className="text-muted-foreground">{habit.full_version}</span>
                              </p>
                              <p className="text-xs">
                                <span className="text-chart-amber font-medium">Min:</span>{" "}
                                <span className="text-muted-foreground">{habit.min_version}</span>
                              </p>
                              {habit.cue_trigger && (
                                <p className="text-xs">
                                  <span className="text-chart-blue font-medium">Cue:</span>{" "}
                                  <span className="text-muted-foreground">{habit.cue_trigger}</span>
                                </p>
                              )}
                            </div>
                            {identity && (
                              <p className="text-[10px] text-muted-foreground mt-1.5">{identity.label}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(habit)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleArchive(habit.id, true)} className="h-8 w-8 text-muted-foreground hover:text-chart-amber">
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Archived Habits */}
      {archivedHabits.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="font-display text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2 hover:text-foreground transition-colors"
          >
            Archived ({archivedHabits.length})
            <motion.span animate={{ rotate: showArchived ? 180 : 0 }} className="text-xs">▼</motion.span>
          </button>
          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-2"
              >
                {archivedHabits.map((habit) => (
                  <Card key={habit.id} className="glass-card-premium opacity-60">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground line-through">{habit.name}</p>
                        <p className="text-[10px] text-muted-foreground">{habit.full_version}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toggleArchive(habit.id, false)} className="text-muted-foreground hover:text-success">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Habit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-card-premium border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> New Habit
            </DialogTitle>
          </DialogHeader>
          {renderFormFields(addForm, setAddForm)}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={createHabit.isPending} className="btn-gradient rounded-xl">
              <Check className="h-4 w-4 mr-1" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
