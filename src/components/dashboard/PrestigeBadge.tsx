import { getPrestigeLevel } from "@/hooks/useGamification";

export function PrestigeBadge({ xp }: { xp: number }) {
  const level = getPrestigeLevel(xp);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${level.color} text-white`}
      title={`${level.label} — ${xp} XP`}
    >
      {level.icon} {level.label}
    </span>
  );
}
