import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const PRO_PRODUCT_ID = "prod_U3MLpsv4H1GTYC";
const TRIAL_DAYS = 7;

interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isTrial: boolean;
  trialDaysLeft: number;
}

function getTrialInfo(createdAt: string | null): { isTrial: boolean; trialDaysLeft: number } {
  if (!createdAt) return { isTrial: false, trialDaysLeft: 0 };
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_DAYS - daysPassed);
  return { isTrial: daysLeft > 0, trialDaysLeft: daysLeft };
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isLoading: true,
    productId: null,
    subscriptionEnd: null,
    isTrial: false,
    trialDaysLeft: 0,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({ isSubscribed: false, isLoading: false, productId: null, subscriptionEnd: null, isTrial: false, trialDaysLeft: 0 });
        return;
      }

      // Check trial status from profile creation date
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("user_id", session.user.id)
        .single();

      const trialInfo = getTrialInfo(profile?.created_at ?? session.user.created_at);

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setState({
        isSubscribed: data?.subscribed ?? false,
        isLoading: false,
        productId: data?.product_id ?? null,
        subscriptionEnd: data?.subscription_end ?? null,
        ...trialInfo,
      });
    } catch (err) {
      console.error("Subscription check failed:", err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    const interval = setInterval(checkSubscription, 60_000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

  // User has Pro access if they have an active subscription OR are in trial
  const isPro = (state.isSubscribed && state.productId === PRO_PRODUCT_ID) || state.isTrial;

  return { ...state, isPro, checkSubscription };
}
