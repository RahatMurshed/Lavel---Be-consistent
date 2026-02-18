import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIdentityAlignment } from "./useIdentityAlignment";
import { useWeekFriction } from "./useHabits";

const DRIFT_THRESHOLD = 15; // % drop triggers alert
const WARNING_THRESHOLD = 40; // alignment below this is a warning
const CRITICAL_THRESHOLD = 25; // alignment below this is critical

export interface DriftAlert {
  identityId: string;
  identityLabel: string;
  emoji: string | null;
  color: string | null;
  currentPct: number;
  previousPct: number; // simulated from 14-day window
  drift: number;
  severity: "info" | "warning" | "critical";
  habits: { name: string; alignmentPct: number; fullVotes: number; minVotes: number; missVotes: number }[];
}

export interface CorrectivePlan {
  diagnosis: string;
  urgency: string;
  daily_actions: { action: string; timing: string; habit_link: string }[];
  environment_changes: string[];
  motivation: string;
}

export function useIdentityDriftMonitor() {
  const { data: current7d, isLoading: loading7d } = useIdentityAlignment(7);
  const { data: previous14d, isLoading: loading14d } = useIdentityAlignment(14);

  const alerts = useMemo<DriftAlert[]>(() => {
    if (!current7d || !previous14d) return [];

    return current7d
      .map((identity) => {
        const prev = previous14d.find((p) => p.id === identity.id);
        // Previous week estimate: 14d data minus 7d data contribution
        const previousPct = prev ? prev.alignmentPct : identity.alignmentPct;
        const drift = previousPct - identity.alignmentPct;

        let severity: "info" | "warning" | "critical" = "info";
        if (identity.alignmentPct < CRITICAL_THRESHOLD || drift >= DRIFT_THRESHOLD + 10) {
          severity = "critical";
        } else if (identity.alignmentPct < WARNING_THRESHOLD || drift >= DRIFT_THRESHOLD) {
          severity = "warning";
        }

        // Only return meaningful alerts
        if (severity === "info" && drift < 5) return null;

        return {
          identityId: identity.id,
          identityLabel: identity.label,
          emoji: identity.emoji,
          color: identity.color,
          currentPct: identity.alignmentPct,
          previousPct,
          drift,
          severity,
          habits: identity.habits.map((h) => ({
            name: h.name,
            alignmentPct: h.alignmentPct,
            fullVotes: h.fullVotes,
            minVotes: h.minVotes,
            missVotes: h.missVotes,
          })),
        };
      })
      .filter(Boolean) as DriftAlert[];
  }, [current7d, previous14d]);

  return {
    alerts: alerts.sort((a, b) => {
      const sevOrder = { critical: 0, warning: 1, info: 2 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    }),
    isLoading: loading7d || loading14d,
  };
}

export function useCorrectivePlan() {
  const [plan, setPlan] = useState<CorrectivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (alert: DriftAlert, frictionTriggers: { tag: string; count: number }[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("drift-corrective-plan", {
        body: {
          identityLabel: alert.identityLabel,
          currentPct: alert.currentPct,
          previousPct: alert.previousPct,
          habits: alert.habits,
          frictionTriggers,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setPlan(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate plan");
    } finally {
      setIsLoading(false);
    }
  };

  return { plan, isLoading, error, generate, setPlan };
}

export function useDismissAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ identityId }: { identityId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      // Store dismissal
      const { error } = await supabase.from("identity_drift_alerts").insert({
        user_id: user.id,
        identity_id: identityId,
        alert_type: "dismissed",
        dismissed: true,
        alignment_pct: 0,
        previous_pct: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["identity-drift-dismissed"] });
    },
  });
}
