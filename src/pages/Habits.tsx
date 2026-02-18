import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HabitManagement } from "@/components/dashboard/HabitManagement";
import { DashboardRight } from "@/components/dashboard/DashboardRight";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/ui/BrandMark";
import type { User } from "@supabase/supabase-js";

const HabitsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", session.user.id)
        .single();
      if (!profile?.onboarding_completed) { navigate("/onboarding"); return; }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user || loading) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <BrandMark size="sm" />
                <span className="font-display font-semibold gradient-text">Lavel</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.user_metadata?.display_name || user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="flex-1 flex overflow-hidden">
            <HabitManagement />
            <DashboardRight />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HabitsPage;
