import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: { svg: 20, ring: "h-8 w-8" },
  md: { svg: 28, ring: "h-10 w-10" },
  lg: { svg: 40, ring: "h-14 w-14" },
};

export function BrandMark({ size = "md", className, animated = false }: BrandMarkProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {animated && (
        <div
          className={cn(
            "absolute rounded-2xl bg-gradient-to-r from-primary via-chart-blue to-primary opacity-30 blur-md animate-pulse-glow",
            s.ring
          )}
        />
      )}
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(258, 62%, 63%)" />
            <stop offset="50%" stopColor="hsl(215, 70%, 62%)" />
            <stop offset="100%" stopColor="hsl(172, 50%, 55%)" />
          </linearGradient>
        </defs>
        {/* Diamond / sparkle mark */}
        <path
          d="M16 2L20.5 11.5L30 16L20.5 20.5L16 30L11.5 20.5L2 16L11.5 11.5L16 2Z"
          fill="url(#brandGrad)"
        />
        <path
          d="M16 8L18.5 13.5L24 16L18.5 18.5L16 24L13.5 18.5L8 16L13.5 13.5L16 8Z"
          fill="white"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
