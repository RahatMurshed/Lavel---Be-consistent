import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Flame, BrainCircuit, TrendingUp, Fingerprint, SlidersHorizontal, Shield, Activity, Sparkles, Eye } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";

const capabilities = [
  { icon: Fingerprint, theme: "violet" as const, title: "Identity Engine", desc: "Declare who you're becoming and align every habit to that identity." },
  { icon: SlidersHorizontal, theme: "blue" as const, title: "Adaptive Planning", desc: "Energy-aware scheduling that adjusts to your daily capacity." },
  { icon: Shield, theme: "rose" as const, title: "Friction Analysis", desc: "Identify and eliminate what's blocking your consistency." },
  { icon: Activity, theme: "teal" as const, title: "Consistency Score", desc: "Multi-dimensional scoring across completion, stability, and resilience." },
  { icon: Eye, theme: "amber" as const, title: "AI Mirror", desc: "Weekly reflections that surface patterns you can't see yourself." },
  { icon: TrendingUp, theme: "emerald" as const, title: "Momentum Tracking", desc: "Visualize your consistency compounding over time." },
];

const howItWorks = [
  { icon: Fingerprint, theme: "violet" as const, step: "01", title: "Declare Identity", desc: "Choose who you're becoming — Builder, Athlete, Creator, and more." },
  { icon: Flame, theme: "teal" as const, step: "02", title: "Build Habits", desc: "Get an AI-generated habit stack with full and minimum versions." },
  { icon: BrainCircuit, theme: "blue" as const, step: "03", title: "Track & Adapt", desc: "Log daily, get friction insights, and watch your momentum grow." },
];

const demoData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  value: Math.min(95, 20 + i * 5 + Math.sin(i * 0.8) * 10),
}));

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Index = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden neon-grid-bg">
      {/* Parallax glow orbs */}
      <motion.div style={{ y: orbY1 }} className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] parallax-slow" />
      <motion.div style={{ y: orbY2 }} className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-chart-teal/6 rounded-full blur-[120px] parallax-fast" />

      <div className="relative z-10">
        {/* Sticky Nav */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto backdrop-blur-lg bg-background/60 border-b border-transparent hover:border-border/30 transition-colors">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-display font-bold text-xl gradient-text">Lavel</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:border hover:border-border/50">
              Sign In <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center min-h-[80vh] flex flex-col items-center justify-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkle />
              <span className="text-xs font-medium text-primary">Consistency OS</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-display font-bold text-foreground leading-tight mb-6 glow-text">
              Build the identity
              <br />
              <span className="gradient-text">you're becoming</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Lavel is an AI-powered behavioral operating system that turns your goals into
              identity-aligned habit systems — with adaptive planning, friction analysis, and
              consistency scoring.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                className="btn-gradient text-base px-8 rounded-xl font-medium animate-glow-pulse"
                onClick={() => navigate("/auth")}
              >
                Start Free <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-2 opacity-80">
              Free forever • Pro from $9/mo
            </motion.p>
            <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-6 opacity-60">
              Join 2,000+ people building consistency systems
            </motion.p>
          </motion.div>
        </main>

        {/* AI Capabilities */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
              Everything you need to <span className="gradient-text">stay consistent</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Six AI-powered modules working together to build your consistency operating system.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {capabilities.map((c) => (
              <motion.div
                key={c.title}
                variants={fadeUp}
                className="glass-card-premium hover-float p-6 text-left"
              >
                <PremiumIcon icon={c.icon} theme={c.theme} size="lg" className="mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-1.5">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Momentum Curve Preview */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card-premium p-8 text-center"
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Watch your consistency <span className="gradient-text">compound</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Your momentum curve shows how small daily actions create exponential growth.
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(258, 62%, 63%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(258, 62%, 63%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="value" stroke="hsl(258, 62%, 63%)" fill="url(#demoGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
              How it <span className="gradient-text">works</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative"
          >
            {/* Gradient connector line (desktop) */}
            <div className="hidden sm:block absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-primary/40 via-chart-blue/40 to-chart-teal/40 -translate-y-1/2" />

            {howItWorks.map((s) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                className="glass-card-premium hover-float p-6 text-center relative z-10"
              >
                <span className="text-xs font-mono text-primary/60 mb-3 block">{s.step}</span>
                <PremiumIcon icon={s.icon} theme={s.theme} size="lg" className="mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Footer */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
              Start building who<br />
              <span className="gradient-text">you're becoming</span>
            </h2>
            <Button
              size="lg"
              className="btn-gradient text-base px-10 rounded-xl font-medium animate-glow-pulse"
              onClick={() => navigate("/auth")}
            >
              Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-display font-semibold text-sm gradient-text">Lavel</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Lavel. All rights reserved.</p>
        </footer>
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
