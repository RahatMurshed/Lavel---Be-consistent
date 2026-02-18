import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Sun,
  Fingerprint,
  ListChecks,
  BarChart3,
  Brain,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TOUR_STEPS = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "This is your daily command center. Log your habits here each day and see your momentum at a glance.",
  },
  {
    icon: Sun,
    title: "Morning Check-in",
    description:
      "Rate your energy each morning (1–10). The app adapts and suggests Full or Minimum habit versions based on how you feel.",
  },
  {
    icon: Fingerprint,
    title: "Identity Alignment",
    description:
      "These are the identities you chose during onboarding. The percentage shows how aligned your recent actions are with each identity.",
  },
  {
    icon: ListChecks,
    title: "Habits",
    description:
      "Manage your habit stack. Each habit has a Full version (ideal) and a Minimum version (for low-energy days). Both count as completed.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Your professional performance report. See completion rates, streaks, trends, and detailed breakdowns over any time period.",
  },
  {
    icon: Brain,
    title: "AI Mirror",
    description:
      "Get AI-powered reflections on your consistency patterns, personalized coaching, and corrective plans when you drift.",
  },
];

interface FeatureTourProps {
  userId: string;
  onComplete: () => void;
}

export function FeatureTour({ userId, onComplete }: FeatureTourProps) {
  const [step, setStep] = useState(0);

  const finish = async () => {
    await supabase
      .from("profiles")
      .update({ tour_completed: true } as any)
      .eq("user_id", userId);
    onComplete();
  };

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.8 }}
          className="glass-card-premium w-full max-w-md mx-4 p-8 relative"
        >
          {/* Skip button */}
          <button
            onClick={finish}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step counter */}
          <div className="flex items-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-primary"
                    : i < step
                    ? "w-3 bg-primary/40"
                    : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <Icon className="h-7 w-7 text-primary" />
          </div>

          {/* Content */}
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            {current.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm mb-8">
            {current.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {step + 1} / {TOUR_STEPS.length}
            </span>

            {isLast ? (
              <Button size="sm" onClick={finish} className="btn-gradient">
                Get Started
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                className="btn-gradient"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
