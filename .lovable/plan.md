

# LEVEL -- Wiring Real Data + Core Feature Implementation

## What's Already Built
- Auth (login/signup), onboarding flow (identity + outcomes + AI habit generation)
- Database: profiles, identities, habits, behavior_logs, daily_checkins, seasonal_modes (all with RLS)
- Dashboard shell: 3-panel layout with mock data
- Edge function: habit-generator (AI-powered)
- Design system: dark premium theme, glass cards, glow effects

## What This Plan Delivers
Wire the dashboard to real data and implement the core behavioral engine features from the PRD. This is broken into 5 parts.

---

## Part 1: Live Dashboard Data

Replace all mock/static data in the dashboard with real queries.

**Sidebar (AppSidebar)**
- Fetch user's identities from database
- Show each identity card with real alignment_pct and linked habit count
- Dynamically render identity colors and labels

**Center Panel (DashboardCenter)**
- Fetch today's habits from database (active habits for current user)
- Show Full/Min/Miss buttons that actually write to `behavior_logs`
- After logging, update UI optimistically
- Calculate real Consistency Score from behavior_logs (last 30 days)
- Show real streak count (consecutive days with at least one completion)
- Compute burnout risk from habit load + recent completion variance
- Momentum Curve chart: query last 14 days of behavior_logs, compute daily completion %, render as Recharts line chart

**Right Panel (DashboardRight)**
- Morning Check-in: save energy + mood to `daily_checkins` table, disable after submission for today
- AI Mirror: fetch latest weekly report or show placeholder until enough data exists
- Micro Challenge: generate from existing habits using a simple random selection (full AI micro-challenge generator comes later)

---

## Part 2: Friction Logging System

When user taps "Miss" on a habit:
- Show a modal/dialog asking "What stopped you?"
- Multi-select friction tags: Low energy, Time mismanagement, Forgot, Mood, Environment, Competing priority, Motivation
- Optional notes field
- Save to `behavior_logs` with status='miss', friction_trigger (comma-separated tags), and notes
- Dashboard card: "Top Friction This Week" -- query this week's miss logs, aggregate friction tags, show distribution

---

## Part 3: Consistency Score Engine

Create a utility/hook that computes the 5-dimensional score from the PRD:

```
A = Completion Ratio (30%) = completed / expected
B = Trend Stability (25%) = inverse of daily completion variance
C = Recovery Speed (20%) = (7 - avg days to return after miss) / 7 * 100
D = Resilience Index (15%) = completion rate on low-energy days (energy <= 4)
E = Energy Alignment (10%) = completion % during peak energy hours
```

- Compute from last 30 days of behavior_logs + daily_checkins
- Display as large circular gauge on dashboard (using a radial progress component)
- Show breakdown with each component labeled
- Color coding: Red (0-40), Yellow (40-70), Green (70-100)

---

## Part 4: Adaptive Daily Planning

Enhance the morning check-in flow:
- When energy <= 3: auto-switch all habits to show "Minimum" version prominently, with "Full" as optional
- When energy >= 7: show "Full" version prominently with encouragement text
- Add visual badges on each habit card showing current mode (Full / Min)
- Store the daily plan mode in daily_checkins

---

## Part 5: Database Updates

New migration to add:
- `consistency_scores` table: user_id, score_date, overall_score, completion_ratio, trend_stability, recovery_speed, resilience_index, energy_alignment
- `weekly_reports` table: user_id, week_start, report_content (JSONB), created_at
- Add `emoji` column to `identities` table (for identity card display)
- Add `stress_level` column to `daily_checkins` table (integer 1-10, nullable)

---

## Technical Details

### New/Modified Files

| File | Action |
|------|--------|
| `src/hooks/useHabits.ts` | New -- fetch habits, identities, logs with React Query |
| `src/hooks/useConsistencyScore.ts` | New -- compute 5-dimensional score |
| `src/hooks/useDailyCheckin.ts` | New -- manage morning check-in state |
| `src/components/dashboard/DashboardCenter.tsx` | Rewrite -- real data, habit logging, momentum chart |
| `src/components/dashboard/DashboardRight.tsx` | Rewrite -- real check-in, AI mirror, micro-challenge |
| `src/components/AppSidebar.tsx` | Rewrite -- real identities from DB |
| `src/components/dashboard/FrictionModal.tsx` | New -- friction logging dialog |
| `src/components/dashboard/ConsistencyGauge.tsx` | New -- circular score visualization |
| `src/components/dashboard/MomentumChart.tsx` | New -- Recharts line chart |
| `src/components/dashboard/FrictionSummary.tsx` | New -- top friction card |
| Migration SQL | New -- consistency_scores, weekly_reports tables + identity emoji column |

### Data Flow

1. User opens dashboard -> hooks fetch habits, identities, today's checkin, recent logs
2. If no checkin today -> Morning Check-in prompt appears in right panel
3. User submits energy/mood -> daily_checkins row created -> habits display adapts (full vs min mode)
4. User taps Full/Min/Miss -> behavior_logs row created -> if Miss, friction modal opens
5. Consistency score recomputes on each page load from last 30 days of logs
6. Momentum chart shows last 14 days of daily completion percentages

