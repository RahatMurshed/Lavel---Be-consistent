import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    checkSubscription();
    const timer = setTimeout(() => navigate("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [checkSubscription, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome to Pro!</h1>
        <p className="text-muted-foreground mb-6">
          Your subscription is active. All premium features are now unlocked.
        </p>
        <Button className="btn-gradient px-8 rounded-xl" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Redirecting automatically in 5 seconds...</p>
      </motion.div>
    </div>
  );
}
