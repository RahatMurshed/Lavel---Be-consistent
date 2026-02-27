import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Crown, Zap } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const FREE_FEATURES = [
  "1 Identity",
  "3 Habits",
  "Basic Dashboard",
  "Manual Logging",
  "Daily Check-ins",
];

const PRO_FEATURES = [
  "Unlimited Identities",
  "Unlimited Habits",
  "AI Mirror & Coach",
  "Advanced Analytics",
  "Groups & Challenges",
  "Leaderboard",
  "Smart Notifications",
  "Data Export",
  "Priority Support",
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isPro, isTrial, trialDaysLeft, isLoading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden neon-grid-bg">
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <BrandMark size="sm" />
            <span className="font-display font-bold text-xl gradient-text">Lavel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-3">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Start free, upgrade when you're ready to unlock the full power of your consistency OS.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card-premium p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-display font-semibold text-lg text-foreground">Free</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-display font-bold text-foreground">$0</span>
                <span className="text-sm text-muted-foreground"> /month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Perfect for getting started with habit tracking.</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isPro && (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              )}
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-premium p-6 flex flex-col ring-2 ring-primary/30 relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Most Popular
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-lg text-foreground">Pro</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-display font-bold text-foreground">$9</span>
                <span className="text-sm text-muted-foreground"> /month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Everything you need to build unstoppable consistency.</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <Button variant="outline" className="w-full" onClick={handleManage}>
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className="btn-gradient w-full"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || isLoading}
                >
                  {checkoutLoading ? "Loading..." : "Upgrade to Pro"}
                </Button>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
