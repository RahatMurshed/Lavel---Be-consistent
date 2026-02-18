
# Advanced Data-Driven Analytics Explorer

## Problem

The current Analytics page shows basic completion-rate charts and simple skill counts. The PRD demands **serious analytics for nerds and achievers** -- deep data intelligence with behavioral insights, energy/mood correlations, identity performance tracking, XP trajectory modeling, streak analysis, and exportable growth reports across all time scales.

## What's Missing (per PRD Section 5)

1. **All-Time period** -- only Weekly/Monthly/Half-Year/Yearly exist
2. **Streak analytics** -- no current/longest streak visualization or streak heatmap
3. **Energy and mood trend correlation** -- daily_checkins data (energy, mood, stress) is never surfaced in analytics
4. **Identity alignment performance** -- per-identity completion tracking over time is missing
5. **XP accumulation curve** -- xp_events table is queried but never charted over time
6. **Consistency Score radar** -- the 5D consistency score (completion ratio, trend stability, recovery speed, resilience, energy alignment) is computed but never visualized here
7. **Behavioral insights panel** -- no AI-generated text insights summarizing the data
8. **Friction analysis** -- friction_trigger data from behavior_logs is not surfaced
9. **Prestige rank progression** -- no visualization of rank trajectory
10. **Exportable/shareable reports** -- no export functionality

---

## Implementation Plan

### 1. Add "All-Time" Period Option

Add a fifth period to the PERIODS array: `{ key: "all", label: "All-Time", days: 9999, bucketLabel: "Month" }`. The `useRecentLogs` hook already accepts a `days` parameter, so this works automatically.

### 2. New Hook: `useAnalyticsData`

Create `src/hooks/useAnalyticsData.ts` that consolidates all data sources for the analytics page:

- **XP timeline**: Query `xp_events` table grouped by date, compute cumulative XP curve
- **Energy/mood trends**: Query `daily_checkins` for energy and stress over the selected period
- **Friction analysis**: Query `behavior_logs` where `friction_trigger IS NOT NULL` and aggregate top friction tags
- **Streak calculation**: Compute current and longest streaks from behavior_logs date sequences
- **Identity performance**: Use `useIdentityAlignment` with dynamic day ranges per period

### 3. Rebuild Analytics Page with 6 Sections

Restructure `src/pages/Analytics.tsx` into a tabbed/scrollable layout with these sections:

**Section A -- Summary Stats Row (enhanced)**
- Avg Completion % (with delta)
- Current Streak (with longest streak indicator)
- Total XP (with prestige rank badge inline)
- Skills Learned (this period)
- Consistency Score (overall number)
- Habits Completed (with delta)

**Section B -- Completion and XP Charts (existing, enhanced)**
- Completion rate area chart (keep existing)
- XP accumulation curve (new line chart from xp_events, showing cumulative XP over time with prestige level threshold lines)

**Section C -- Consistency Radar**
- Radar chart (recharts RadarChart) showing the 5 dimensions from `useConsistencyScore`: Completion Ratio, Trend Stability, Recovery Speed, Resilience Index, Energy Alignment
- Each axis 0-100, with a filled polygon showing the user's profile

**Section D -- Behavioral Intelligence**
- **Energy-Completion Correlation**: Scatter-style chart or dual-axis line chart overlaying daily energy level with completion rate to show correlation
- **Mood Trend**: Line chart of daily mood/energy from `daily_checkins`
- **Friction Heatmap**: Horizontal bar chart of top friction triggers (from `useWeekFriction`, extended to match period)
- **Best/Worst Days**: Identify which days of the week have highest/lowest completion rates

**Section E -- Identity Performance**
- Grouped bar chart or radar showing each identity's alignment % over the selected period
- Per-identity trend lines showing drift direction

**Section F -- Habit Streaks Heatmap**
- GitHub-style contribution grid: a calendar heatmap where each cell represents a day, colored by completion % (green gradient for high, red for low, gray for no data)
- Shows last 90-365 days depending on period selection

### 4. Exportable Report Card

Add an "Export Report" button that renders a summary as a styled, self-contained component and uses `html2canvas` or browser print API to generate a shareable image/PDF. Since adding a new dependency may not be ideal, we'll use the browser's native `window.print()` with a print-optimized CSS class as a first pass.

### 5. AI Growth Insights

Add a collapsible "AI Insights" card that calls the existing `consistency-coach` edge function (or a new lightweight variant) to generate a 3-4 sentence narrative summary of the analytics data -- e.g., "Your completion rate is up 12% this month. Tuesdays are your strongest day. Your 'Fitness' identity is drifting -- consider re-engaging morning workouts."

---

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useAnalyticsData.ts` | Consolidated hook for XP timeline, energy trends, friction data, streak stats |
| `src/components/analytics/ConsistencyRadar.tsx` | 5D radar chart component |
| `src/components/analytics/XPTimeline.tsx` | XP accumulation curve with prestige thresholds |
| `src/components/analytics/EnergyCorrelation.tsx` | Dual-axis energy vs completion chart |
| `src/components/analytics/FrictionAnalysis.tsx` | Horizontal bar chart of friction triggers |
| `src/components/analytics/StreakHeatmap.tsx` | GitHub-style calendar heatmap |
| `src/components/analytics/IdentityPerformance.tsx` | Per-identity alignment chart |
| `src/components/analytics/AIInsights.tsx` | AI-generated narrative insights card |
| `src/components/analytics/BestWorstDays.tsx` | Day-of-week performance breakdown |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/Analytics.tsx` | Complete rebuild to compose all new sections |
| `src/hooks/useHabits.ts` | Extend `useWeekFriction` to accept configurable days parameter |

### Data Sources Used
- `behavior_logs` -- completion rates, streaks, friction triggers
- `daily_checkins` -- energy, mood, stress levels
- `xp_events` -- XP timeline and accumulation
- `user_gamification` -- current XP, prestige level, streaks
- `consistency_scores` -- 5D consistency metrics
- `identities` + `habits` -- identity alignment performance
- `skills` -- skill growth curve

### No Database Migrations Needed
All data already exists in the tables. This is purely a frontend analytics visualization upgrade.

### Dependencies
- `recharts` RadarChart (already installed) for the consistency radar
- All other chart types (Area, Bar, Line, Pie, Scatter) already available in recharts
- `framer-motion` (already installed) for section animations
- No new packages required
