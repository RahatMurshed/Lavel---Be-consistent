import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorTheme = "violet" | "teal" | "amber" | "rose" | "blue" | "emerald";

const themeStyles: Record<ColorTheme, { bg: string; glow: string }> = {
  violet: {
    bg: "from-[hsl(180,65%,48%)] to-[hsl(220,65%,58%)]",
    glow: "shadow-[0_0_20px_-4px_hsl(180,65%,48%,0.4)]",
  },
  teal: {
    bg: "from-[hsl(172,50%,55%)] to-[hsl(152,55%,52%)]",
    glow: "shadow-[0_0_20px_-4px_hsl(172,50%,55%,0.4)]",
  },
  amber: {
    bg: "from-[hsl(38,85%,65%)] to-[hsl(350,65%,65%)]",
    glow: "shadow-[0_0_20px_-4px_hsl(38,85%,65%,0.4)]",
  },
  rose: {
    bg: "from-[hsl(350,65%,65%)] to-[hsl(258,62%,63%)]",
    glow: "shadow-[0_0_20px_-4px_hsl(350,65%,65%,0.4)]",
  },
  blue: {
    bg: "from-[hsl(215,70%,62%)] to-[hsl(172,50%,55%)]",
    glow: "shadow-[0_0_20px_-4px_hsl(215,70%,62%,0.4)]",
  },
  emerald: {
    bg: "from-[hsl(152,55%,52%)] to-[hsl(172,50%,55%)]",
    glow: "shadow-[0_0_20px_-4px_hsl(152,55%,52%,0.4)]",
  },
};

interface PremiumIconProps {
  icon: LucideIcon;
  theme?: ColorTheme;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: { container: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { container: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { container: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
};

export function PremiumIcon({ icon: Icon, theme = "violet", size = "md", className, animated = false }: PremiumIconProps) {
  const { bg, glow } = themeStyles[theme];
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center bg-gradient-to-br",
        bg,
        glow,
        s.container,
        animated && "animate-float",
        className
      )}
    >
      <Icon className={cn(s.icon, "text-white drop-shadow-sm")} strokeWidth={2} />
    </div>
  );
}
