import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SeasonalMode = "sprint" | "grace" | "maintenance";

export const MODE_META: Record<SeasonalMode, {
  label: string;
  description: string;
  emphasis: "full" | "min" | "consistency";
  color: string;
  bgClass: string;
  gradientClass: string;
}> = {
  sprint: {
    label: "Sprint",
    description: "High intensity — maximize Full completions",
    emphasis: "full",
    color: "text-success",
    bgClass: "bg-success/10",
    gradientClass: "from-chart-teal to-chart-emerald",
  },
  grace: {
    label: "Grace",
    description: "Protect momentum — Minimums are the win",
    emphasis: "min",
    color: "text-chart-amber",
    bgClass: "bg-chart-amber/10",
    gradientClass: "from-chart-amber to-chart-rose",
  },
  maintenance: {
    label: "Maintenance",
    description: "Steady consistency — just show up",
    emphasis: "consistency",
    color: "text-chart-blue",
    bgClass: "bg-chart-blue/10",
    gradientClass: "from-chart-blue to-chart-violet",
  },
};

export function useActiveSeasonalMode() {
  return useQuery({
    queryKey: ["active-seasonal-mode"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("seasonal_modes")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; mode: SeasonalMode; started_at: string; active: boolean } | null;
    },
  });
}

export function useSetSeasonalMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mode: SeasonalMode) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deactivate current mode
      await supabase
        .from("seasonal_modes")
        .update({ active: false, ended_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("active", true);

      // Activate new mode
      const { data, error } = await supabase
        .from("seasonal_modes")
        .insert({
          user_id: user.id,
          mode,
          active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-seasonal-mode"] });
    },
  });
}
