

# Leaderboard Page + Dedicated Group Pages with Analytics

## Overview

Three major additions:

1. **Global Leaderboard page** -- Individual XP leaderboard for all opted-in users, plus a group-level leaderboard comparing groups by aggregate stats
2. **Dedicated Group page** (`/dashboard/groups/:id`) -- A full page for each group with members, challenges, group analytics, and group leaderboard
3. **Group Analytics** -- Aggregate stats per group: total challenges completed, member activity, completion rates

---

## 1. Global Leaderboard Page

New route: `/dashboard/leaderboard`

### Individual Leaderboard Tab
- Uses existing `useLeaderboard()` hook (queries `profiles` + `user_gamification` for opted-in users)
- Shows rank, avatar initial, display name, XP, prestige level badge, streak
- Top 3 get gold/silver/bronze medal icons
- Current user highlighted

### Group Leaderboard Tab
- Ranks all groups the user belongs to by aggregate member XP
- Shows group name, member count, total XP, average streak
- Requires a new hook `useGroupLeaderboard()` that fetches group members' gamification data

### Database Changes
- Update `profiles` SELECT RLS policy: allow users who opted into leaderboard to be visible to other authenticated users (currently only self-visible)
- Add a policy: `Leaderboard profiles are visible to authenticated users` for SELECT on profiles WHERE `leaderboard_opt_in = true` (only exposes display_name and avatar_url via the existing leaderboard hook)
- Similarly, `user_gamification` needs a SELECT policy for leaderboard-opted-in users

---

## 2. Dedicated Group Page

New route: `/dashboard/groups/:id`

Clicking a group card on the Groups list page navigates to this dedicated page instead of expanding inline.

### Page Sections

**Header**: Group name, description, invite code copy button, member count, "Back to Groups" link

**Members Panel**: Avatar initials, names, roles -- same as current but in a proper card layout

**Challenges Section**: Active and past challenges with the full leaderboard expansion (moved from inline Groups.tsx)

**Group Analytics Tab**: 
- Total challenges created / completed
- Member participation rate (how many members join challenges)
- Challenge completion chart (bar chart showing completed vs total per challenge)
- Most active members (by challenge progress)

**Group Leaderboard Tab**:
- Ranks members within this group by total XP
- Shows streaks and prestige levels

---

## 3. Simplified Groups List Page

The current Groups.tsx gets simplified:
- Shows group cards with name, description, member count
- Clicking a group navigates to `/dashboard/groups/:id`
- Create/Join group forms stay here
- Remove the inline expanded detail view (moved to dedicated page)

---

## Technical Details

### Database Migration

```text
-- Allow authenticated users to see profiles of leaderboard-opted-in users
CREATE POLICY "Leaderboard profiles visible"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR leaderboard_opt_in = true
  );

-- Allow authenticated users to see gamification of leaderboard-opted-in users
CREATE POLICY "Leaderboard gamification visible"
  ON public.user_gamification FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = user_gamification.user_id
      AND profiles.leaderboard_opt_in = true
    )
  );

-- Allow group members to see each other's gamification
CREATE POLICY "Group members can view gamification"
  ON public.user_gamification FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = user_gamification.user_id
    )
  );
```

Note: The existing `profiles` SELECT policy is restrictive (self-only). We need to either replace it or add a permissive policy. Since the existing policy is `RESTRICTIVE` (permissive = No), we need to drop it and recreate as permissive, or add a new permissive one. Given the current setup uses restrictive policies, we'll drop the old SELECT and add a new permissive one that covers both cases.

### New Files

| File | Purpose |
|------|---------|
| `src/pages/Leaderboard.tsx` | Global leaderboard page with Individual and Group tabs |
| `src/pages/GroupDetail.tsx` | Dedicated page for a single group |
| `src/hooks/useGroupLeaderboard.ts` | Hook for group-level leaderboard + group member stats |
| `src/components/groups/GroupAnalytics.tsx` | Analytics charts for a single group |
| `src/components/groups/GroupMemberLeaderboard.tsx` | Within-group member ranking component |

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes: `/dashboard/leaderboard` and `/dashboard/groups/:id` |
| `src/components/AppSidebar.tsx` | Add "Leaderboard" nav item with Trophy icon |
| `src/pages/Groups.tsx` | Simplify to list view with navigation to group detail pages |
| `src/hooks/useGroups.ts` | Add `useGroupDetail(id)` hook for single group fetch |
| `src/hooks/useLeaderboard.ts` | Keep as-is for individual; add group ranking export |

### Routing

```text
/dashboard/leaderboard       --> Leaderboard.tsx (Individual + Group tabs)
/dashboard/groups             --> Groups.tsx (list + create/join)
/dashboard/groups/:id         --> GroupDetail.tsx (members, challenges, analytics, leaderboard)
```

### Leaderboard Page Design

Two tabs using Radix Tabs:
- **Individual**: Table with Rank, User, XP, Level, Streak columns
- **Groups**: Table with Rank, Group Name, Members, Total XP, Avg Streak

### Group Detail Page Design

Four tabs:
- **Overview**: Members list + active challenges with inline leaderboards
- **Challenges**: Full challenge management (create, AI suggest, join, progress) -- moved from Groups.tsx
- **Analytics**: Charts showing group performance metrics
- **Leaderboard**: Member-vs-member ranking within the group

### Group Analytics Component

Uses `recharts` (already installed) to display:
- Bar chart: challenge completion rates
- Stats cards: total challenges, completion rate, most active member
- Data sourced from `challenge_progress` and `group_challenges` tables (already accessible via existing RLS)

### Nav Update

Add to `AppSidebar.tsx` nav items:
```text
{ title: "Leaderboard", url: "/dashboard/leaderboard", icon: Trophy }
```

Placed between "Analytics" and "AI Mirror" in the nav order.

