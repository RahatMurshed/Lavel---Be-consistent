import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LayoutGrid, Flame, TrendingUp, Sparkles, Target, BookOpen, Users, Trophy, Crown, CreditCard, Settings } from "lucide-react";
import { useIdentities } from "@/hooks/useHabits";
import { Skeleton } from "@/components/ui/skeleton";
import { SeasonalModeSwitcher } from "@/components/dashboard/SeasonalModeSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, pro: false },
  { title: "Identity", url: "/dashboard/identity", icon: Target, pro: false },
  { title: "Habits", url: "/dashboard/habits", icon: Flame, pro: false },
  { title: "Skills", url: "/dashboard/skills", icon: BookOpen, pro: false },
  { title: "Analytics", url: "/dashboard/analytics", icon: TrendingUp, pro: true },
  { title: "Leaderboard", url: "/dashboard/leaderboard", icon: Trophy, pro: true },
  { title: "AI Mirror", url: "/dashboard/mirror", icon: Sparkles, pro: true },
  { title: "Groups", url: "/dashboard/groups", icon: Users, pro: true },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, pro: false },
];


export function AppSidebar() {
  const { data: identities, isLoading } = useIdentities();
  const { isPro, isTrial, trialDaysLeft, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    }
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent className="pt-4">
        {/* Identity Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Identities
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : !identities || identities.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">No identities yet</p>
              ) : (
                identities.map((identity) => {
                  const habitCount = identity.habits?.length || 0;
                  return (
                    <div key={identity.id} className="glass-card-premium hover-float p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {identity.logo_url ? (
                          <img
                            src={identity.logo_url}
                            alt={identity.label}
                            className="h-7 w-7 rounded-md object-cover ring-1 ring-border/30"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-md bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                            {identity.label.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground">{identity.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{habitCount}</span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${identity.alignment_pct || 0}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{identity.alignment_pct || 0}% aligned</p>
                    </div>
                  );
                })
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seasonal Mode */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Season
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <SeasonalModeSwitcher />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50 transition-colors rounded-lg"
                      activeClassName="bg-sidebar-accent text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      <span className="flex-1">{item.title}</span>
                      {item.pro && !isPro && !subLoading && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                          PRO
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Plan */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Plan
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              {isPro && !isTrial ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Pro Plan</span>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" onClick={handleManageSubscription}>
                    <CreditCard className="h-3 w-3 mr-1.5" /> Manage Billing
                  </Button>
                </div>
              ) : isTrial ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium text-foreground">Free Trial</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
                  </p>
                  <Button
                    size="sm"
                    className="btn-gradient w-full text-xs"
                    onClick={() => navigate("/pricing")}
                  >
                    <Crown className="h-3 w-3 mr-1.5" /> Upgrade Now
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="btn-gradient w-full text-xs"
                  onClick={() => navigate("/pricing")}
                >
                  <Crown className="h-3 w-3 mr-1.5" /> Upgrade to Pro
                </Button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Theme */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Appearance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
