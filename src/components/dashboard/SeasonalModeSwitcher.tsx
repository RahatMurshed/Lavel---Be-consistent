import { Card, CardContent } from "@/components/ui/card";
import { useActiveSeasonalMode, useSetSeasonalMode, MODE_META, SeasonalMode } from "@/hooks/useSeasonalMode";
import { motion } from "framer-motion";
import { Rocket, Leaf, Gauge } from "lucide-react";
import { toast } from "sonner";

const MODE_ICONS: Record<SeasonalMode, typeof Rocket> = {
  sprint: Rocket,
  grace: Leaf,
  maintenance: Gauge,
};

export function SeasonalModeSwitcher() {
  const { data: activeMode, isLoading } = useActiveSeasonalMode();
  const setMode = useSetSeasonalMode();

  const currentMode = (activeMode?.mode as SeasonalMode) || null;

  const handleSwitch = (mode: SeasonalMode) => {
    if (mode === currentMode) return;
    setMode.mutate(mode, {
      onSuccess: () => toast.success(`Switched to ${MODE_META[mode].label} Mode`),
      onError: (err) => toast.error(err.message),
    });
  };

  if (isLoading) return null;

  return (
    <div className="space-y-2">
      {(Object.keys(MODE_META) as SeasonalMode[]).map((mode) => {
        const meta = MODE_META[mode];
        const Icon = MODE_ICONS[mode];
        const isActive = mode === currentMode;

        return (
          <motion.button
            key={mode}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSwitch(mode)}
            disabled={setMode.isPending}
            className="w-full text-left"
          >
            <Card
              className={`overflow-hidden transition-all duration-300 ${
                isActive
                  ? "glass-card-premium ring-1 ring-primary/30 glow-primary"
                  : "glass-card-premium opacity-60 hover:opacity-80"
              }`}
            >
              {isActive && <div className={`h-0.5 bg-gradient-to-r ${meta.gradientClass}`} />}
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg ${meta.bgClass} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${isActive ? meta.color : "text-foreground"}`}>
                      {meta.label}
                    </p>
                    {isActive && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${meta.bgClass} ${meta.color}`}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.button>
        );
      })}
    </div>
  );
}
