import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

const today = () => format(new Date(), "yyyy-MM-dd");

export function useIdentities() {
  return useQuery({
    queryKey: ["identities"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("identities")
        .select("*, habits(id)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveHabits() {
  return useQuery({
    queryKey: ["active-habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("habits")
        .select("*, identities(label, color, emoji)")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useAllHabits() {
  return useQuery({
    queryKey: ["all-habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("habits")
        .select("*, identities(id, label, color, emoji)")
        .eq("user_id", user.id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        name?: string;
        full_version?: string;
        min_version?: string;
        cue_trigger?: string | null;
        identity_id?: string | null;
        active?: boolean;
        sort_order?: number;
      };
    }) => {
      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-habits"] });
      queryClient.invalidateQueries({ queryKey: ["active-habits"] });
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habit: {
      name: string;
      full_version: string;
      min_version: string;
      cue_trigger?: string;
      identity_id?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name: habit.name,
          full_version: habit.full_version,
          min_version: habit.min_version,
          cue_trigger: habit.cue_trigger || null,
          identity_id: habit.identity_id || null,
        })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-habits"] });
      queryClient.invalidateQueries({ queryKey: ["active-habits"] });
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useTodayLogs() {
  return useQuery({
    queryKey: ["today-logs", today()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today());
      if (error) throw error;
      return data;
    },
  });
}

export function useLogHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      status,
      frictionTrigger,
      notes,
      energyLevel,
    }: {
      habitId: string;
      status: string;
      frictionTrigger?: string;
      notes?: string;
      energyLevel?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upsert: if a log exists for this habit+date, update it
      const { data, error } = await supabase
        .from("behavior_logs")
        .upsert(
          {
            user_id: user.id,
            habit_id: habitId,
            log_date: today(),
            status,
            friction_trigger: frictionTrigger || null,
            notes: notes || null,
            energy_level: energyLevel || null,
          },
          { onConflict: "habit_id,log_date" }
        )
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-logs"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
      queryClient.invalidateQueries({ queryKey: ["consistency-data"] });
    },
  });
}

export function useRecentLogs(days = 30) {
  return useQuery({
    queryKey: ["recent-logs", days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const since = format(subDays(new Date(), days), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", since)
        .order("log_date");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identity: { label: string; emoji: string; color: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("identities")
        .insert({
          user_id: user.id,
          label: identity.label,
          emoji: identity.emoji,
          color: identity.color,
        })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useDeleteIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identityId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Unlink habits
      await supabase
        .from("habits")
        .update({ identity_id: null })
        .eq("identity_id", identityId);

      // 2. Delete drift alerts
      await supabase
        .from("identity_drift_alerts")
        .delete()
        .eq("identity_id", identityId);

      // 3. Delete identity
      const { error } = await supabase
        .from("identities")
        .delete()
        .eq("id", identityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
      queryClient.invalidateQueries({ queryKey: ["all-habits"] });
      queryClient.invalidateQueries({ queryKey: ["active-habits"] });
      queryClient.invalidateQueries({ queryKey: ["identity-drift"] });
    },
  });
}

export function useWeekFriction() {
  return useQuery({
    queryKey: ["week-friction"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const since = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("behavior_logs")
        .select("friction_trigger")
        .eq("user_id", user.id)
        .eq("status", "miss")
        .gte("log_date", since)
        .not("friction_trigger", "is", null);
      if (error) throw error;

      // Aggregate friction tags
      const counts: Record<string, number> = {};
      data.forEach((log) => {
        if (log.friction_trigger) {
          log.friction_trigger.split(",").forEach((tag) => {
            const t = tag.trim();
            if (t) counts[t] = (counts[t] || 0) + 1;
          });
        }
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));
    },
  });
}
