import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Flame, BrainCircuit, TrendingUp } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { PremiumIcon } from "@/components/ui/PremiumIcon";

const features = [
  { icon: Flame, theme: "teal" as const, title: "Identity-Based Habits", desc: "Build habits that align with who you're becoming" },
  { icon: BrainCircuit, theme: "violet" as const, title: "AI-Powered Insights", desc: "Get weekly reflections on your consistency patterns" },
  { icon: TrendingUp, theme: "blue" as const, title: "Momentum Tracking", desc: "Visualize your consistency acceleration over time" },
];

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-chart-teal/6 rounded-full blur-[120px]" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-display font-bold text-xl gradient-text">Lavel</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:border hover:border-border/50">
            Sign In <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </nav>

        {/* Hero */}
        <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkle />
              <span className="text-xs font-medium text-primary">Consistency OS</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Build the identity
              <br />
              <span className="gradient-text">you're becoming</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Lavel is an AI-powered behavioral operating system that turns your goals into
              identity-aligned habit systems — with adaptive planning, friction analysis, and
              consistency scoring.
            </p>
            <Button
              size="lg"
              className="btn-gradient text-base px-8 rounded-xl font-medium"
              onClick={() => navigate("/auth")}
            >
              Get Started <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24"
          >
            {features.map((f) => (
              <div key={f.title} className="glass-card-premium p-6 text-left group hover:scale-[1.02] transition-transform duration-300">
                <PremiumIcon icon={f.icon} theme={f.theme} size="lg" className="mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

function Sparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-primary">
      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" />
    </svg>
  );
}

export default Index;
