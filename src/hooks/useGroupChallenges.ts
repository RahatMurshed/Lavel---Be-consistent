import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

// --- Challenges CRUD ---

export function useGroupChallenges(groupId: string | null) {
  return useQuery({
    queryKey: ["group-challenges", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_challenges")
        .select("*")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challenge: {
      group_id: string;
      title: string;
      description?: string;
      challenge_type?: string;
      target_value?: number;
      end_date?: string;
      ai_generated?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("group_challenges")
        .insert({ created_by: user.id, ...challenge })
        .select()
        .single();
      if (error) throw error;
      // Auto-join creator
      await supabase.from("challenge_progress").insert({
        challenge_id: data.id,
        user_id: user.id,
      });
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["group-challenges", vars.group_id] });
    },
  });
}

export function useJoinChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, groupId }: { challengeId: string; groupId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("challenge_progress")
        .insert({ challenge_id: challengeId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-leaderboard", vars.challengeId] });
      qc.invalidateQueries({ queryKey: ["group-challenges", vars.groupId] });
    },
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, increment }: { challengeId: string; increment: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current progress
      const { data: existing } = await supabase
        .from("challenge_progress")
        .select("id, current_value")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single();

      if (!existing) throw new Error("Not joined");

      // Get target
      const { data: challenge } = await supabase
        .from("group_challenges")
        .select("target_value")
        .eq("id", challengeId)
        .single();

      const newValue = (existing.current_value || 0) + increment;
      const completed = challenge ? newValue >= challenge.target_value : false;

      const { error } = await supabase
        .from("challenge_progress")
        .update({
          current_value: newValue,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
      return { completed, newValue };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-leaderboard", vars.challengeId] });
    },
  });
}

// --- Leaderboard for a challenge ---

export function useChallengeLeaderboard(challengeId: string | null) {
  return useQuery({
    queryKey: ["challenge-leaderboard", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_progress")
        .select("*, profiles:user_id(display_name, avatar_url)")
        .eq("challenge_id", challengeId!)
        .order("current_value", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// --- AI Suggestions ---

export interface AISuggestion {
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  duration_days: number;
  emoji: string;
}

export function useTeamChallengeSuggestions() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (groupName: string, memberCount: number, existingChallenges: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("team-challenge-generator", {
        body: { groupName, memberCount, existingChallenges },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setSuggestions(data?.challenges || []);
    } catch (e: any) {
      setError(e.message || "Failed to generate");
    } finally {
      setIsLoading(false);
    }
  };

  return { suggestions, isLoading, error, generate, setSuggestions };
}
