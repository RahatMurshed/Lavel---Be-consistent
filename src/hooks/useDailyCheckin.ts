import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const today = () => format(new Date(), "yyyy-MM-dd");

export function useTodayCheckin() {
  return useQuery({
    queryKey: ["today-checkin", today()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("checkin_date", today())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ energy, mood, stressLevel }: { energy: number; mood?: string; stressLevel?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("daily_checkins")
        .upsert(
          {
            user_id: user.id,
            checkin_date: today(),
            energy,
            mood: mood || null,
            stress_level: stressLevel || null,
          },
          { onConflict: "user_id,checkin_date" }
        )
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-checkin"] });
    },
  });
}
