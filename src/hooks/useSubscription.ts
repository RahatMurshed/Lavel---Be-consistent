import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const PRO_PRODUCT_ID = "prod_U3MLpsv4H1GTYC";

interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isLoading: true,
    productId: null,
    subscriptionEnd: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({ isSubscribed: false, isLoading: false, productId: null, subscriptionEnd: null });
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setState({
        isSubscribed: data?.subscribed ?? false,
        isLoading: false,
        productId: data?.product_id ?? null,
        subscriptionEnd: data?.subscription_end ?? null,
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

  const isPro = state.isSubscribed && state.productId === PRO_PRODUCT_ID;

  return { ...state, isPro, checkSubscription };
}
