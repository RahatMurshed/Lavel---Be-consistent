import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Target, Brain, BarChart3 } from "lucide-react";

const features = [
  { icon: Target, title: "Identity-Based Habits", desc: "Build habits that align with who you're becoming" },
  { icon: Brain, title: "AI-Powered Insights", desc: "Get weekly reflections on your consistency patterns" },
  { icon: BarChart3, title: "Momentum Tracking", desc: "Visualize your consistency acceleration over time" },
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
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">Lavel</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/auth")}>
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
              <span className="text-primary">you're becoming</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Lavel is an AI-powered behavioral operating system that turns your goals into
              identity-aligned habit systems — with adaptive planning, friction analysis, and
              consistency scoring.
            </p>
            <Button
              size="lg"
              className="glow-primary text-base px-8"
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
              <div key={f.title} className="glass-card p-6 text-left">
                <f.icon className="h-8 w-8 text-primary mb-3" />
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
