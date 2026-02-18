import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  ArrowRight,
  LayoutDashboard,
  Fingerprint,
  ListChecks,
  GraduationCap,
  BarChart3,
  Brain,
  Users,
} from "lucide-react";

const WORKFLOW_STEPS = [
  { label: "Define Identity", icon: Fingerprint },
  { label: "Build Habits", icon: ListChecks },
  { label: "Log Daily", icon: LayoutDashboard },
  { label: "Review Analytics", icon: BarChart3 },
  { label: "Get AI Coaching", icon: Brain },
];

const KEY_CONCEPTS = [
  {
    term: "Full vs Min Versions",
    description:
      "Full is the ideal version of a habit. Min is the bare minimum for low-energy days. Both count as completed.",
  },
  {
    term: "Consistency Score",
    description:
      "A multi-dimensional score based on completion ratio, trend stability, recovery speed, resilience, and energy alignment.",
  },
  {
    term: "Identity Drift",
    description:
      "When your recent habit completion drops significantly compared to your baseline, the app alerts you and can generate a recovery plan.",
  },
  {
    term: "Morning Check-in",
    description:
      "Your daily energy level (1–10) determines whether the app suggests full or minimum habit versions.",
  },
  {
    term: "Friction Triggers",
    description:
      "When you miss a habit, you can log why. The app tracks these to identify patterns holding you back.",
  },
];

const PAGES = [
  { icon: LayoutDashboard, name: "Dashboard", desc: "Daily overview with momentum chart, consistency gauge, and habit logging" },
  { icon: Fingerprint, name: "Identity", desc: "Manage your chosen identities and see alignment percentages" },
  { icon: ListChecks, name: "Habits", desc: "Add, edit, reorder, and manage your full habit stack" },
  { icon: GraduationCap, name: "Skills", desc: "Track skills you are learning (independent of habits)" },
  { icon: BarChart3, name: "Analytics", desc: "Professional performance report with charts, tables, and AI insights" },
  { icon: Brain, name: "AI Mirror", desc: "AI-powered weekly reflections and consistency coaching" },
  { icon: Users, name: "Groups", desc: "Join or create accountability groups with team challenges" },
];

export function HelpDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label="How it works"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-lg">How It Works</SheetTitle>
        </SheetHeader>

        {/* Workflow */}
        <section className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your Workflow
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 text-xs font-medium text-foreground">
                  <s.icon className="h-3.5 w-3.5 text-primary" />
                  {s.label}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Key Concepts
          </h3>
          <div className="space-y-3">
            {KEY_CONCEPTS.map((c) => (
              <div key={c.term} className="glass-card p-3">
                <p className="text-sm font-medium text-foreground mb-1">{c.term}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pages */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Pages
          </h3>
          <div className="space-y-2">
            {PAGES.map((p) => (
              <div key={p.name} className="flex items-start gap-3 p-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <p.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </SheetContent>
    </Sheet>
  );
}
