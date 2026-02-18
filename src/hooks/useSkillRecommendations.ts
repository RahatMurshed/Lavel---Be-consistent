import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RecommendedSkill {
  name: string;
  category: string;
  reason: string;
}

export interface SkillStack {
  theme: string;
  emoji: string;
  description: string;
  skills: RecommendedSkill[];
}

export function useSkillRecommendations() {
  const [stacks, setStacks] = useState<SkillStack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (skills: any[], identities: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("skill-recommender", {
        body: { skills, identities },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setStacks(data?.stacks || []);
    } catch (e: any) {
      setError(e.message || "Failed to generate recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  return { stacks, isLoading, error, generate };
}
