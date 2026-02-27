// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock useSubscription
const mockUseSubscription = vi.fn();
vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => mockUseSubscription(),
}));

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
          order: () => Promise.resolve({ data: [] }),
        }),
        gte: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [] }),
          }),
        }),
        order: () => Promise.resolve({ data: [] }),
      }),
    }),
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
  },
}));

// Mock react-query hooks used by pages
vi.mock("@/hooks/useHabits", () => ({
  useActiveHabits: () => ({ data: [] }),
  useAllHabits: () => ({ data: [] }),
  useRecentLogs: () => ({ data: [] }),
}));
vi.mock("@/hooks/useSkills", () => ({
  useSkills: () => ({ data: [] }),
  SKILL_CATEGORIES: {},
}));
vi.mock("@/hooks/useIdentityAlignment", () => ({
  useIdentityAlignment: () => ({ data: [] }),
}));
vi.mock("@/hooks/useAnalyticsData", () => ({
  useEnergyMoodTrends: () => ({ data: [] }),
  useFrictionAnalysis: () => ({ data: [] }),
  useLatestConsistencyScores: () => ({ data: null }),
  useBestWorstDays: () => ({ data: null }),
  useStreakHeatmapData: () => ({ data: [] }),
}));
vi.mock("@/hooks/useLeaderboard", () => ({
  useLeaderboard: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/useGroupLeaderboard", () => ({
  useGroupLeaderboard: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/useGroups", () => ({
  useMyGroups: () => ({ data: [], isLoading: false }),
  useCreateGroup: () => ({ mutateAsync: vi.fn() }),
  useJoinGroup: () => ({ mutateAsync: vi.fn() }),
}));

// Lazy imports so mocks apply
const { default: Analytics } = await import("@/pages/Analytics");
const { default: Groups } = await import("@/pages/Groups");
const { default: Leaderboard } = await import("@/pages/Leaderboard");

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Feature Gating - Free Users", () => {
  beforeEach(() => {
    mockUseSubscription.mockReturnValue({
      isPro: false,
      isSubscribed: false,
      isLoading: false,
      productId: null,
      subscriptionEnd: null,
      checkSubscription: vi.fn(),
    });
  });

  it("shows UpgradePrompt on Analytics page for free users", () => {
    renderWithRouter(<Analytics />);
    expect(screen.getByText("Unlock Analytics")).toBeInTheDocument();
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("shows UpgradePrompt on Groups page for free users", () => {
    renderWithRouter(<Groups />);
    expect(screen.getByText("Unlock Groups")).toBeInTheDocument();
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("shows UpgradePrompt on Leaderboard page for free users", () => {
    renderWithRouter(<Leaderboard />);
    expect(screen.getByText("Unlock Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });
});

describe("Feature Gating - Pro Users", () => {
  beforeEach(() => {
    mockUseSubscription.mockReturnValue({
      isPro: true,
      isSubscribed: true,
      isLoading: false,
      productId: "prod_U3MLpsv4H1GTYC",
      subscriptionEnd: null,
      checkSubscription: vi.fn(),
    });
  });

  it("does NOT show UpgradePrompt on Analytics for Pro users", () => {
    renderWithRouter(<Analytics />);
    expect(screen.queryByText("Unlock Analytics")).not.toBeInTheDocument();
  });

  it("does NOT show UpgradePrompt on Groups for Pro users", () => {
    renderWithRouter(<Groups />);
    expect(screen.queryByText("Unlock Groups")).not.toBeInTheDocument();
  });

  it("does NOT show UpgradePrompt on Leaderboard for Pro users", () => {
    renderWithRouter(<Leaderboard />);
    expect(screen.queryByText("Unlock Leaderboard")).not.toBeInTheDocument();
  });
});
