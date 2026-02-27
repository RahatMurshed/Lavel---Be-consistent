import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface UpgradePromptProps {
  feature?: string;
}

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Crown className="h-8 w-8 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
        Unlock {feature || "this feature"}
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Upgrade to Lavel Pro to access {feature || "premium features"}, unlimited identities & habits, AI coaching, and more.
      </p>
      <Button
        className="btn-gradient px-8 rounded-xl"
        onClick={() => navigate("/pricing")}
      >
        Upgrade to Pro <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
      <p className="text-xs text-muted-foreground mt-3">Starting at $9/month</p>
    </motion.div>
  );
}
