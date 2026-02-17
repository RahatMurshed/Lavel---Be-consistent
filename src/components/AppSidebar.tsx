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
import { LayoutDashboard, Target, BarChart3, Calendar, Brain } from "lucide-react";
import { useIdentities } from "@/hooks/useHabits";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Habits", url: "/dashboard/habits", icon: Target },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Daily Plan", url: "/dashboard/plan", icon: Calendar },
  { title: "AI Mirror", url: "/dashboard/mirror", icon: Brain },
];

const IDENTITY_COLORS: Record<string, string> = {
  violet: "from-chart-violet to-chart-blue",
  teal: "from-chart-teal to-chart-emerald",
  amber: "from-chart-amber to-chart-rose",
  rose: "from-chart-rose to-chart-violet",
  blue: "from-chart-blue to-chart-teal",
  emerald: "from-chart-emerald to-chart-amber",
};

export function AppSidebar() {
  const { data: identities, isLoading } = useIdentities();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent className="pt-4">
        {/* Identity Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Identities
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </>
              ) : !identities || identities.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">No identities yet</p>
              ) : (
                identities.map((identity) => {
                  const gradientClass = IDENTITY_COLORS[identity.color || "violet"] || IDENTITY_COLORS.violet;
                  const habitCount = identity.habits?.length || 0;
                  return (
                    <div key={identity.id} className="glass-card p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{identity.emoji || "🎯"}</span>
                        <span className="text-sm font-medium text-foreground">{identity.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{habitCount} habits</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
                          style={{ width: `${identity.alignment_pct || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{identity.alignment_pct || 0}% aligned</p>
                    </div>
                  );
                })
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
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
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
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
