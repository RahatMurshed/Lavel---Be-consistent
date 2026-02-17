import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, ArrowLeft, Loader2, Sparkles, Check, X, RefreshCw } from "lucide-react";

const IDENTITY_OPTIONS = [
  { label: "Builder", emoji: "🛠️", desc: "Create products, ship code, launch things" },
  { label: "Athlete", emoji: "🏋️", desc: "Physical fitness, strength, endurance" },
  { label: "Reader", emoji: "📚", desc: "Learn, absorb knowledge, grow intellectually" },
  { label: "Creator", emoji: "🎨", desc: "Write, design, make art, express yourself" },
  { label: "Leader", emoji: "👑", desc: "Manage, inspire, organize teams" },
  { label: "Mindful", emoji: "🧘", desc: "Meditate, reflect, cultivate inner peace" },
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

      // Create identities
      const identityRows = selectedIdentities.map((label) => ({ user_id: userId, label }));
      const { data: createdIdentities, error: idErr } = await supabase
        .from("identities")
        .insert(identityRows)
        .select();
      if (idErr) throw idErr;

      // Create habits linked to first matching identity
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

      // Mark onboarding complete
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
      <div className="inline-flex items-center gap-2 mb-2">
        <Zap className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-3xl font-display font-bold text-foreground">Let's build your identity system</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        In the next few steps, you'll declare who you're becoming, set your goals, and get an AI-generated habit stack.
      </p>
      <Button onClick={() => setStep(1)} className="glow-primary">
        Let's Go <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>,

    // Step 1: Identity
    <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Who are you becoming?</h2>
        <p className="text-muted-foreground text-sm mt-1">Select 1–3 identities</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {IDENTITY_OPTIONS.map((id) => (
          <button
            key={id.label}
            onClick={() => toggleIdentity(id.label)}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedIdentities.includes(id.label)
                ? "border-primary bg-primary/10 glow-primary"
                : "border-border/50 bg-secondary/30 hover:border-primary/30"
            }`}
          >
            <span className="text-2xl">{id.emoji}</span>
            <p className="font-medium text-foreground text-sm mt-2">{id.label}</p>
            <p className="text-xs text-muted-foreground">{id.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button onClick={() => setStep(2)} disabled={selectedIdentities.length === 0} className="glow-primary">
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Outcomes
    <motion.div key="outcomes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground">What are your goals?</h2>
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
        <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button
          onClick={generateHabits}
          disabled={generating || !outcomes.some((o) => o.trim())}
          className="glow-primary"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate Habits"}
        </Button>
      </div>
    </motion.div>,

    // Step 3: Review
    <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Your Habit Stack</h2>
        <p className="text-muted-foreground text-sm mt-1">Review and adjust your AI-generated habits</p>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {habits.map((h, i) => (
          <Card key={i} className="glass-card">
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
        <Button variant="ghost" onClick={() => { setStep(2); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
        </Button>
        <Button onClick={saveAndFinish} disabled={saving || habits.length === 0} className="glow-primary">
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
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? "w-10 bg-primary" : "w-6 bg-secondary"
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
