import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check, X, RefreshCw, Hammer, Dumbbell, BookOpen, Palette, Crown, Leaf } from "lucide-react";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import { BrandMark } from "@/components/ui/BrandMark";

const IDENTITY_OPTIONS = [
  { label: "Builder", icon: Hammer, theme: "violet" as const, desc: "Create products, ship code, launch things" },
  { label: "Athlete", icon: Dumbbell, theme: "teal" as const, desc: "Physical fitness, strength, endurance" },
  { label: "Reader", icon: BookOpen, theme: "blue" as const, desc: "Learn, absorb knowledge, grow intellectually" },
  { label: "Creator", icon: Palette, theme: "rose" as const, desc: "Write, design, make art, express yourself" },
  { label: "Leader", icon: Crown, theme: "amber" as const, desc: "Manage, inspire, organize teams" },
  { label: "Mindful", icon: Leaf, theme: "emerald" as const, desc: "Meditate, reflect, cultivate inner peace" },
];

type HabitSuggestion = {
  name: string;
  full_version: string;
  min_version: string;
  impact_weight: number;
  cue_trigger: string;
};

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [habits, setHabits] = useState<HabitSuggestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const toggleIdentity = (label: string) => {
    setSelectedIdentities((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : prev.length < 3 ? [...prev, label] : prev
    );
  };

  const addOutcome = () => {
    if (outcomes.length < 3) setOutcomes([...outcomes, ""]);
  };

  const updateOutcome = (idx: number, val: string) => {
    setOutcomes(outcomes.map((o, i) => (i === idx ? val : o)));
  };

  const removeOutcome = (idx: number) => {
    if (outcomes.length > 1) setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const generateHabits = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("habit-generator", {
        body: {
          identities: selectedIdentities,
          outcomes: outcomes.filter((o) => o.trim()),
        },
      });
      if (error) throw error;
      setHabits(data.habits || []);
      setStep(3);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const removeHabit = (idx: number) => {
    setHabits(habits.filter((_, i) => i !== idx));
  };

  const saveAndFinish = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");
      const userId = session.user.id;

      const identityRows = selectedIdentities.map((label) => ({ user_id: userId, label }));
      const { data: createdIdentities, error: idErr } = await supabase
        .from("identities")
        .insert(identityRows)
        .select();
      if (idErr) throw idErr;

      const habitRows = habits.map((h, idx) => ({
        user_id: userId,
        identity_id: createdIdentities?.[0]?.id || null,
        name: h.name,
        full_version: h.full_version,
        min_version: h.min_version,
        impact_weight: h.impact_weight,
        cue_trigger: h.cue_trigger,
        sort_order: idx,
      }));
      const { error: habErr } = await supabase.from("habits").insert(habitRows);
      if (habErr) throw habErr;

      const { error: profErr } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", userId);
      if (profErr) throw profErr;

      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-6">
      <BrandMark size="lg" animated className="mx-auto mb-2" />
      <h2 className="text-3xl font-display font-bold">
        Let's build your <span className="gradient-text">identity system</span>
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        In the next few steps, you'll declare who you're becoming, set your goals, and get an AI-generated habit stack.
      </p>
      <Button onClick={() => setStep(1)} className="btn-gradient rounded-xl px-6">
        Let's Go <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>,

    // Step 1: Identity
    <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold">
          Who are you <span className="gradient-text">becoming</span>?
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Select 1–3 identities</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {IDENTITY_OPTIONS.map((id) => {
          const selected = selectedIdentities.includes(id.label);
          return (
            <motion.button
              key={id.label}
              onClick={() => toggleIdentity(id.label)}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selected
                  ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30 scale-[1.02]"
                  : "border-border/30 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/30"
              }`}
            >
              <PremiumIcon icon={id.icon} theme={id.theme} size="md" className="mb-3" />
              <p className="font-medium text-foreground text-sm">{id.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{id.desc}</p>
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(0)} className="hover:border hover:border-border/50"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button onClick={() => setStep(2)} disabled={selectedIdentities.length === 0} className="btn-gradient rounded-xl">
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Outcomes
    <motion.div key="outcomes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold">
          What are your <span className="gradient-text">goals</span>?
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Add 1–3 high-level outcomes</p>
      </div>
      <div className="space-y-3">
        {outcomes.map((o, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={o}
              onChange={(e) => updateOutcome(i, e.target.value)}
              placeholder={`e.g., "Launch a SaaS product"`}
              className="bg-secondary/50 border-border/50"
            />
            {outcomes.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeOutcome(i)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {outcomes.length < 3 && (
          <Button variant="ghost" size="sm" onClick={addOutcome} className="text-muted-foreground">
            + Add another goal
          </Button>
        )}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(1)} className="hover:border hover:border-border/50"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button
          onClick={generateHabits}
          disabled={generating || !outcomes.some((o) => o.trim())}
          className="btn-gradient rounded-xl"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate Habits"}
        </Button>
      </div>
    </motion.div>,

    // Step 3: Review
    <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold">
          Your <span className="gradient-text">Habit Stack</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Review and adjust your AI-generated habits</p>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {habits.map((h, i) => (
          <Card key={i} className="glass-card-premium">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{h.name}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs"><span className="text-success">Full:</span> <span className="text-muted-foreground">{h.full_version}</span></p>
                    <p className="text-xs"><span className="text-chart-amber">Min:</span> <span className="text-muted-foreground">{h.min_version}</span></p>
                    {h.cue_trigger && <p className="text-xs"><span className="text-chart-blue">Cue:</span> <span className="text-muted-foreground">{h.cue_trigger}</span></p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeHabit(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => { setStep(2); }} className="hover:border hover:border-border/50">
          <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
        </Button>
        <Button onClick={saveAndFinish} disabled={saving || habits.length === 0} className="btn-gradient rounded-xl">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
          {saving ? "Saving..." : "Start My Journey"}
        </Button>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-chart-teal/8 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg px-4 relative z-10">
        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "w-10 bg-gradient-to-r from-primary to-chart-blue" : "w-6 bg-secondary"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
