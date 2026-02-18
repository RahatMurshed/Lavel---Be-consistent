import { motion, AnimatePresence } from "framer-motion";
import { PRESTIGE_LEVELS } from "@/hooks/useGamification";

interface LevelUpOverlayProps {
  show: boolean;
  level: string;
  onClose: () => void;
}

export function LevelUpOverlay({ show, level, onClose }: LevelUpOverlayProps) {
  const meta = PRESTIGE_LEVELS.find((l) => l.key === level) || PRESTIGE_LEVELS[0];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="glass-card-premium p-8 text-center space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl"
            >
              {meta.icon}
            </motion.div>
            <h2 className="text-2xl font-display font-bold gradient-text">Level Up!</h2>
            <p className="text-muted-foreground">
              You've reached <span className={`font-bold bg-gradient-to-r ${meta.color} bg-clip-text text-transparent`}>{meta.label}</span>
            </p>
            <button onClick={onClose} className="btn-gradient px-6 py-2 rounded-full text-sm font-medium">
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
