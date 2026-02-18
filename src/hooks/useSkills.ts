import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id)
        .order("date_learned", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (skill: { name: string; category: string; notes?: string; date_learned?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("skills")
        .insert({ user_id: user.id, ...skill })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export const SKILL_CATEGORIES = [
  { value: "technical", label: "Technical", color: "hsl(var(--chart-blue))" },
  { value: "creative", label: "Creative", color: "hsl(var(--chart-violet))" },
  { value: "physical", label: "Physical", color: "hsl(var(--chart-teal))" },
  { value: "social", label: "Social", color: "hsl(var(--chart-amber))" },
  { value: "mental", label: "Mental", color: "hsl(var(--chart-emerald))" },
  { value: "general", label: "General", color: "hsl(var(--chart-rose))" },
];
