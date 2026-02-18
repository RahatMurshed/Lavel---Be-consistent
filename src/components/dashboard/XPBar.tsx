import { useGamification, getPrestigeLevel, getNextLevel } from "@/hooks/useGamification";
import { motion } from "framer-motion";

export function XPBar() {
  const { data } = useGamification();
  const xp = data?.total_xp || 0;
  const level = getPrestigeLevel(xp);
  const next = getNextLevel(xp);
  
  const progress = next
    ? ((xp - level.minXP) / (next.minXP - level.minXP)) * 100
    : 100;

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <span className="text-base" title={level.label}>{level.icon}</span>
      <div className="flex-1 space-y-0.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-medium text-muted-foreground">{level.label}</span>
          <span className="text-[10px] text-muted-foreground">{xp} XP</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        {next && (
          <p className="text-[9px] text-muted-foreground">{next.minXP - xp} XP to {next.label}</p>
        )}
      </div>
    </div>
  );
}
