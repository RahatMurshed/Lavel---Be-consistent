

# Full System Rebuild: Premium Growth Intelligence Platform

## Overview

This plan transforms "Lavel" from an identity-based habit tracker into a full **Premium Growth Intelligence System** as defined in the PRD. The existing foundation (auth, habits, identity, AI coaching, seasonal modes) is strong and will be preserved and extended. New modules for **Skill Tracking**, **Gamification (XP/Prestige)**, **Social/Leaderboards**, and **Multi-Scale Analytics** will be built on top.

---

## What Already Exists (Keep and Enhance)

- Authentication + onboarding flow
- Habit tracking with min/full versions and friction logging
- Identity system with alignment percentages
- Seasonal modes (Sprint/Grace/Maintenance)
- AI Consistency Coach edge function
- Daily check-in and momentum chart
- Premium dark UI with glass morphism and animations

---

## Phase 1: Database Schema Expansion

New tables required via migrations:

```text
skills
  id, user_id, name, category, date_learned, notes, created_at

xp_events
  id, user_id, source (habit_full, habit_min, skill_learned, challenge_completed),
  xp_amount, created_at

user_gamification
  id, user_id, total_xp, prestige_level (bronze/silver/gold/platinum/diamond),
  current_streak, longest_streak, updated_at

badges
  id, user_id, badge_key, badge_name, earned_at

groups
  id, name, description, invite_code, created_by, created_at

group_members
  id, group_id, user_id, role (admin/member), joined_at

growth_reports
  id, user_id, report_type (weekly/monthly/half_yearly/yearly),
  period_start, period_end, report_data (jsonb), created_at
```

All tables get RLS policies scoped to authenticated users. Groups use member-based access.

---

## Phase 2: Gamification Engine

### XP System
- Habit logged (Full): +20 XP
- Habit logged (Min): +10 XP
- Skill learned: +30 XP
- Challenge completed: +50 XP
- Daily streak bonus: +5 XP per consecutive day

### Prestige Levels
- Bronze: 0 XP
- Silver: 500 XP
- Gold: 2,000 XP
- Platinum: 5,000 XP
- Diamond: 15,000 XP

### Badges
- "Consistency Master" -- 30-day streak
- "Skill Builder" -- 10 skills logged
- "Growth Champion" -- all habits completed for a full week
- "Early Bird" -- check-in before 7 AM for 7 days
- "Iron Will" -- recover from 3+ misses in a row

### Implementation
- Hook: `useGamification` (reads XP, level, badges)
- XP awarded automatically on habit log and skill creation via database trigger or mutation side-effect
- Level-up animation overlay component
- Badge notification toasts

---

## Phase 3: Skill and Learning Tracker

### New Page: `/dashboard/skills`
- Log skills with name, category, date, and optional notes
- Skill timeline visualization (vertical timeline with category color coding)
- Category filter and search
- Skill count stats card on dashboard

### Hook: `useSkills`
- CRUD operations for skills table
- Category aggregation for charts

---

## Phase 4: Growth Dashboard and Multi-Scale Analytics

### New Page: `/dashboard/analytics` (rebuild existing placeholder)
- Time period selector: Weekly / Monthly / Half-Yearly / Yearly / All-Time
- Animated charts (recharts):
  - Completion rate over time (area chart)
  - Habits vs Skills growth (bar chart)
  - XP accumulation curve
  - Comparative growth % vs previous period
- Stats cards: total habits completed, skills learned, current streak, XP earned

### Reporting
- Auto-generated reports stored in `growth_reports` table
- Exportable/shareable report cards (rendered as styled components)
- Edge function `generate-growth-report` to compile period data

---

## Phase 5: Social and Group Features

### New Pages
- `/dashboard/groups` -- list groups, create/join via invite code
- `/dashboard/leaderboard` -- individual rankings by XP and growth %

### Individual Leaderboard
- Ranks users by total XP, growth %, and achievements
- "Top People" highlight section
- Weekly/monthly/all-time filters

### Group Features
- Create group with name and auto-generated invite code
- Join group via code
- Group leaderboard comparing members
- Group accountability feed (recent member activity)

### Privacy
- Leaderboard participation is opt-in via profile setting
- Display names only (no email exposure)

---

## Phase 6: UI/UX Premium Overhaul

### Dark/Light Mode
- Add `next-themes` ThemeProvider (already installed)
- Light mode CSS variables in `:root` with dark overrides
- Theme toggle in header

### Landing Page Refresh
- Update hero copy to match PRD vision ("Premium Growth Intelligence")
- Add social proof section and feature highlights for new modules
- Prestige rank preview in CTA section

### Dashboard Layout Update
- Add XP bar and prestige badge to header
- Gamification stats row (XP, Level, Streak, Badges)
- Skill count in sidebar identity cards
- Animated level-up overlay

### Navigation Update
- Add sidebar links: Skills, Analytics, Groups, Leaderboard
- Prestige rank badge next to user name in header

---

## Phase 7: AI Coaching Enhancement

### Updated Edge Function
- Include skill data and XP trajectory in AI analysis
- Generate adaptive challenges ("Log 3 skills this week to reach Gold")
- Seasonal quest suggestions based on current period

### AI Nudges Component
- Smart notification cards on dashboard
- Context-aware tips based on time of day, energy, and recent activity

---

## Implementation Order

| Step | What | New Files | Migrations |
|------|-------|-----------|------------|
| 1 | Database migrations for all new tables | -- | Yes (7 tables) |
| 2 | XP/Gamification hooks and triggers | `useGamification.ts`, `useXP.ts` | -- |
| 3 | Gamification UI (XP bar, level badge, level-up animation) | `XPBar.tsx`, `PrestigeBadge.tsx`, `LevelUpOverlay.tsx` | -- |
| 4 | Skill tracker (hook + page + components) | `useSkills.ts`, `Skills.tsx`, `SkillTimeline.tsx` | -- |
| 5 | Analytics dashboard rebuild | `GrowthAnalytics.tsx`, `PeriodSelector.tsx`, `GrowthChart.tsx` | -- |
| 6 | Growth report edge function | `generate-growth-report/index.ts` | -- |
| 7 | Groups (tables already created, hook + pages) | `useGroups.ts`, `Groups.tsx`, `GroupDetail.tsx` | -- |
| 8 | Leaderboard (hook + page) | `useLeaderboard.ts`, `Leaderboard.tsx` | -- |
| 9 | Dark/Light mode toggle | `ThemeToggle.tsx`, CSS updates | -- |
| 10 | Landing page refresh | Update `Index.tsx` | -- |
| 11 | Dashboard header with XP + prestige | Update `Dashboard.tsx`, `AppSidebar.tsx` | -- |
| 12 | AI coaching upgrade | Update `consistency-coach/index.ts` | -- |
| 13 | Badge system and notifications | `BadgeNotification.tsx`, badge trigger logic | -- |

---

## Suggested Additional Features (Beyond PRD)

1. **Focus Timer** -- Built-in Pomodoro timer linked to habits for "time invested" tracking
2. **Weekly Reflection Journal** -- AI-prompted end-of-week reflection that feeds into coaching
3. **Habit Streaks Heatmap** -- GitHub-style contribution grid showing consistency patterns
4. **Achievement Showcase** -- Public profile page to share prestige rank and top badges
5. **Smart Habit Suggestions** -- AI recommends new habits based on skill gaps and identity goals

---

## Technical Notes

- All new tables use `user_id` referencing auth users without foreign keys to `auth.users`
- XP calculations happen client-side on log mutations (with server-side validation possible later)
- Leaderboard queries use a database view or RPC for aggregated rankings
- Group invite codes are 8-character alphanumeric strings generated on creation
- Growth reports use the existing `weekly_reports` pattern extended to multiple periods
- All new routes added to `App.tsx` under `/dashboard/*`
- Existing seasonal modes, friction analysis, and identity alignment are preserved and integrated into the new analytics

