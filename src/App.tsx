import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Identity from "./pages/Identity";
import Habits from "./pages/Habits";
import Mirror from "./pages/Mirror";
import Skills from "./pages/Skills";
import Analytics from "./pages/Analytics";
import Groups from "./pages/Groups";
import Leaderboard from "./pages/Leaderboard";
import GroupDetail from "./pages/GroupDetail";
import { DashboardLayout } from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/identity" element={<Identity />} />
          <Route path="/dashboard/habits" element={<Habits />} />
          <Route path="/dashboard/mirror" element={<Mirror />} />
          <Route path="/dashboard/skills" element={<DashboardLayout><Skills /></DashboardLayout>} />
          <Route path="/dashboard/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/dashboard/groups" element={<DashboardLayout><Groups /></DashboardLayout>} />
          <Route path="/dashboard/groups/:id" element={<DashboardLayout><GroupDetail /></DashboardLayout>} />
          <Route path="/dashboard/leaderboard" element={<DashboardLayout><Leaderboard /></DashboardLayout>} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
