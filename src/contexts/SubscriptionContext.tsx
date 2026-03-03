import { createContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const PRO_PRODUCT_ID = "prod_U3MLpsv4H1GTYC";
const TRIAL_DAYS = 7;
const STORAGE_KEY = "subscription_isPro";
const DEMO_EMAIL = "admin@lavel.demo";

interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isTrial: boolean;
  trialDaysLeft: number;
  isPro: boolean;
  checkSubscription: () => Promise<void>;
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

function getCachedPro(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export const SubscriptionContext = createContext<SubscriptionState>({
  isSubscribed: false,
  isLoading: true,
  productId: null,
  subscriptionEnd: null,
  isTrial: false,
  trialDaysLeft: 0,
  isPro: false,
  checkSubscription: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const cachedPro = getCachedPro();
  const inflightRef = useRef<Promise<void> | null>(null);

  const [state, setState] = useState({
    isSubscribed: false,
    isLoading: true,
    productId: null as string | null,
    subscriptionEnd: null as string | null,
    isTrial: false,
    trialDaysLeft: 0,
  });

  const checkSubscription = useCallback(async () => {
    // Deduplicate: if a check is already in-flight, reuse it
    if (inflightRef.current) return inflightRef.current;

    const promise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setState({ isSubscribed: false, isLoading: false, productId: null, subscriptionEnd: null, isTrial: false, trialDaysLeft: 0 });
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("user_id", session.user.id)
          .single();

        const trialInfo = getTrialInfo(profile?.created_at ?? session.user.created_at);

        const { data, error } = await supabase.functions.invoke("check-subscription");
        if (error) throw error;

        const newState = {
          isSubscribed: data?.subscribed ?? false,
          isLoading: false,
          productId: data?.product_id ?? null,
          subscriptionEnd: data?.subscription_end ?? null,
          ...trialInfo,
        };

        setState(newState);

        const isPro = (newState.isSubscribed && newState.productId === PRO_PRODUCT_ID) || newState.isTrial;
        try { localStorage.setItem(STORAGE_KEY, String(isPro)); } catch {}
      } catch (err) {
        console.error("Subscription check failed:", err);
        setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        inflightRef.current = null;
      }
    })();

    inflightRef.current = promise;
    return promise;
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

  const [isDemoUser, setIsDemoUser] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsDemoUser(session?.user?.email === DEMO_EMAIL);
    });
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsDemoUser(session?.user?.email === DEMO_EMAIL);
    });
    return () => authSub.unsubscribe();
  }, []);

  const isPro = isDemoUser
    ? true
    : state.isLoading
      ? cachedPro
      : (state.isSubscribed && state.productId === PRO_PRODUCT_ID) || state.isTrial;

  return (
    <SubscriptionContext.Provider value={{ ...state, isPro, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
