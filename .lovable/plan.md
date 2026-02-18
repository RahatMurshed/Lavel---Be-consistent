
# Remove Gamification, Build Professional Data Report

## Overview

Strip all XP, prestige levels, badges, and leaderboard gamification from the app. Replace the Analytics page with a clean, professional **Performance Report** that comprehensively shows all habits and skills with completion data, percentages, and charts.

## What Gets Removed

### Files to Delete
- `src/components/dashboard/XPBar.tsx` -- XP progress bar in header
- `src/components/dashboard/PrestigeBadge.tsx` -- Prestige tier badge
- `src/components/dashboard/LevelUpOverlay.tsx` -- Level-up animation
- `src/components/analytics/XPTimeline.tsx` -- XP accumulation chart
- `src/pages/Leaderboard.tsx` -- Entire leaderboard page

### Files to Modify (Remove Gamification References)

| File | What Changes |
|------|-------------|
| `src/components/DashboardLayout.tsx` | Remove `XPBar` import and usage from header |
| `src/pages/Dashboard.tsx` | Remove `XPBar` import and usage from header |
| `src/components/dashboard/DashboardCenter.tsx` | Remove `useAwardXP` import and all `awardXP.mutate()` calls; remove XP toast messages |
| `src/pages/Skills.tsx` | Remove `useAwardXP` import and all `awardXP.mutate()` calls; remove "+XP" labels from buttons |
| `src/pages/Groups.tsx` | Remove `useAwardXP` import and all `awardXP.mutate()` calls; remove XP toast messages |
| `src/components/AppSidebar.tsx` | Remove "Leaderboard" nav item |
| `src/App.tsx` | Remove Leaderboard route and import |

### Hook Stays (For Now)
`src/hooks/useGamification.ts` will remain in the codebase but won't be imported anywhere active. The `user_gamification`, `xp_events`, and `badges` tables stay in the database (no data destruction) but are no longer used.

---

## New Analytics Page: Professional Performance Report

A clean, data-dense report replacing the current gamified analytics. Organized into clear sections:

### Section 1: Period Selector + Export
- Same period tabs: Weekly, Monthly, Half-Year, Yearly, All-Time
- Print/Export button using `window.print()`

### Section 2: Summary Stats (6 cards, no XP)
- **Avg Completion %** (with delta vs previous period)
- **Current Streak** (days, with longest streak)
- **Total Habits Tracked** (active count)
- **Habits Completed** (this period, with delta)
- **Skills Learned** (this period)
- **Consistency Score** (from consistency_scores table)

### Section 3: Completion Rate Over Time
- Area chart showing daily/weekly/monthly completion rate %

### Section 4: Full Habit Report Table
A detailed table listing **every habit** with columns:
- Habit Name
- Identity (parent identity label)
- Full completions count
- Min completions count
- Misses count
- Total logs
- Completion % (full+min / total)
- Status indicator (color-coded bar)

This is the core "report" the user is asking for -- every habit with full data.

### Section 5: Full Skill Report Table
A table listing **every skill** with columns:
- Skill Name
- Category (with color dot)
- Date Learned
- Notes

### Section 6: Charts Grid (2x2)
- **Status Split** -- Pie chart (Full / Min / Miss breakdown)
- **Bucketed Breakdown** -- Stacked bar chart per time bucket
- **Best / Worst Days** -- Day-of-week performance bars
- **Consistency Radar** -- 5D radar chart (completion, stability, recovery, resilience, energy)

### Section 7: Behavioral Intelligence
- **Energy vs Completion Correlation** -- Dual-axis line chart
- **Top Friction Triggers** -- Horizontal bar chart

### Section 8: Identity Performance
- Per-identity alignment bar chart

### Section 9: Streak Heatmap
- GitHub-style grid, kept from current implementation

### Section 10: AI Insights
- Collapsible card, no XP references in prompt

---

## Technical Details

### Modified Analytics Components
- `src/components/analytics/AIInsights.tsx` -- Remove `totalXP` prop and XP reference in prompt
- `src/components/analytics/XPTimeline.tsx` -- Deleted (no longer needed)

### New in Analytics Page
- **Habit Report Table**: Query `useActiveHabits()` + `useRecentLogs(days)` to compute per-habit stats, render as a styled table with sortable data
- **Skill Report Table**: Query `useSkills()` to render all skills with category and date

### Analytics Page Data Sources (unchanged)
- `behavior_logs` via `useRecentLogs`
- `daily_checkins` via `useEnergyMoodTrends`
- `consistency_scores` via `useLatestConsistencyScores`
- `identities` + `habits` via `useIdentityAlignment`
- `skills` via `useSkills`

### No Database Migrations
No tables are created or dropped. Gamification tables remain but are unused.

### Files Changed Summary
| Action | Files |
|--------|-------|
| Delete | `XPBar.tsx`, `PrestigeBadge.tsx`, `LevelUpOverlay.tsx`, `XPTimeline.tsx`, `Leaderboard.tsx` |
| Modify | `Analytics.tsx` (major rewrite), `DashboardLayout.tsx`, `Dashboard.tsx`, `DashboardCenter.tsx`, `Skills.tsx`, `Groups.tsx`, `AppSidebar.tsx`, `App.tsx`, `AIInsights.tsx` |
