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
import { LayoutGrid, Flame, TrendingUp, Compass, Sparkles, Target } from "lucide-react";
import { useIdentities } from "@/hooks/useHabits";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "Identity", url: "/dashboard/identity", icon: Target },
  { title: "Habits", url: "/dashboard/habits", icon: Flame },
  { title: "Analytics", url: "/dashboard/analytics", icon: TrendingUp },
  { title: "Daily Plan", url: "/dashboard/plan", icon: Compass },
  { title: "AI Mirror", url: "/dashboard/mirror", icon: Sparkles },
];

const IDENTITY_COLORS: Record<string, string> = {
  violet: "from-[hsl(258,62%,63%)] to-[hsl(215,70%,62%)]",
  teal: "from-[hsl(172,50%,55%)] to-[hsl(152,55%,52%)]",
  amber: "from-[hsl(38,85%,65%)] to-[hsl(350,65%,65%)]",
  rose: "from-[hsl(350,65%,65%)] to-[hsl(258,62%,63%)]",
  blue: "from-[hsl(215,70%,62%)] to-[hsl(172,50%,55%)]",
  emerald: "from-[hsl(152,55%,52%)] to-[hsl(172,50%,55%)]",
};

export function AppSidebar() {
  const { data: identities, isLoading } = useIdentities();

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
                  const gradientClass = IDENTITY_COLORS[identity.color || "violet"] || IDENTITY_COLORS.violet;
                  const habitCount = identity.habits?.length || 0;
                  return (
                    <div key={identity.id} className="glass-card-premium hover-float p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {identity.emoji || identity.label.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{identity.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{habitCount}</span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-700`}
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
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
