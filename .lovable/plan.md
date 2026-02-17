

# Lavel — Consistency OS (Full Implementation Plan)

## Overview
A behavioral operating system powered by AI that builds identity-based consistency. Dark premium design with hybrid layout density — key metrics at a glance with expandable deep analytics. Powered by Lovable Cloud (Supabase) for backend and Lovable AI for behavioral intelligence.

---

## 1. Authentication & Onboarding
- Email/password sign-up and login with user profiles (name, avatar, timezone)
- Guided onboarding flow:
  1. Declare target identity (e.g., "I am becoming a Builder")
  2. Set 1–3 high-level outcomes (e.g., "Launch a SaaS," "Lose 8kg")
  3. AI generates initial habit stack from outcomes
  4. User reviews, adjusts, and confirms habits

## 2. AI Outcome → Habit Generator
- Input a high-level goal from onboarding or dashboard
- AI returns an **Ordered Habit Stack** with:
  - Identity label (Reader, Athlete, Builder, etc.)
  - Full version and Minimum version of each habit
  - Impact weight, cue/trigger, and timeline
  - "Do More Packages" — grouped systems, not isolated habits
- Users can accept, edit, or regenerate suggestions
- Powered by Lovable AI edge function

## 3. Identity-Based Dashboard (Main View)
- **Three-panel layout:**
  - **Left sidebar**: Identity cards with quick habit access and navigation
  - **Center panel**: Momentum Curve (Recharts), Growth Meter, today's habits, friction log summary
  - **Right panel**: AI reflections, adaptive daily plan, micro-challenges
- **Identity Cards** show growth meter (alignment %), linked habits, and drift alerts
- **Consistency Score** displayed prominently with trend indicator
- **Momentum Curve**: Line chart showing consistency acceleration/deceleration over time
- Expandable sections for deeper analytics (hybrid density approach)

## 4. Adaptive Daily Planning
- **Morning Check-in** modal: energy (1–10 slider) and mood selection
- AI suggests Full or Minimum version for each habit based on input
- **Stress-Load Balancer**: Auto-activates Minimum Mode when energy ≤ 3
- Visual badges showing active mode per habit (Full / Min)
- Accessible from the right panel of the dashboard

## 5. Habit Tracking & Friction Logging
- One-tap completion: Full ✓, Min ✓, or Miss ✗
- On miss: select friction trigger (Low energy, Bad environment, Mood, Time conflict, Distraction, Other)
- Behavior log captures: status, trigger, energy, stress, timestamp
- Calendar heatmap showing daily completion patterns
- After 2+ weeks, AI surfaces friction patterns (e.g., "You miss workouts on Tuesdays after 8 PM")

## 6. Consistency Scoring Engine
- **Formula**: CS = (completed / expected) × trend stability × recovery speed
- Per-habit and overall scores with trend charts
- Overload detection: warns when too many habits are stacking up
- Recovery speed tracking: how fast user bounces back after a miss

## 7. AI Weekly Report ("AI Mirror")
- Auto-generated weekly narrative including:
  - "Who you are becoming" — identity alignment narrative
  - High-Leverage Habit identification
  - Recovery speed metrics with improvement trends
  - Burnout risk detection and warnings
  - Friction pattern analysis with environmental change suggestions
- Report history accessible from dashboard
- Powered by Lovable AI edge function

## 8. Identity Evolution Timeline (Extra)
- Visual timeline showing how identity alignment percentages shift over weeks and months
- Milestone markers for notable improvements or identity shifts
- Helps users see long-term transformation at a glance

## 9. Micro-Commitment Challenges (Extra)
- AI generates contextual mini-challenges (e.g., "Do 5 pushups right now") based on current identity goals
- Appear in the right panel as actionable cards
- Completion reinforces identity without perfectionist pressure
- Lightweight gamification — challenge streaks without punishment for misses

## 10. Seasonal Modes (Extra)
- Users can activate life-phase modes (Exam Season, Holiday, Recovery, Travel, etc.)
- AI adjusts habit expectations and switches more habits to Minimum versions
- Visual indicator on dashboard showing active seasonal mode
- Keeps consistency scoring fair during difficult periods

## 11. Analytics & Insights Page
- Consistency Score breakdown per habit with trend charts
- Friction analysis bar charts (most common failure triggers)
- Energy–performance correlation scatter plot
- Recovery speed timeline
- Habit stability variance (which habits are most volatile)
- All charts using Recharts with pastel accent colors on dark backgrounds

## 12. Design System
- **Dark premium theme**: Deep dark backgrounds, soft gradients, subtle glow effects
- **Pastel accent palette** for charts, identity colors, and interactive elements
- **Rounded cards** with glass-morphism-inspired subtle borders
- **Premium typography** with clear hierarchy
- **Hybrid density**: Key metrics visible at a glance, expandable panels for deep dives
- Responsive design with mobile-optimized daily check-in and habit tracking

## 13. Backend Architecture (Lovable Cloud)
- **Database tables**: profiles, identities, habits, behavior_logs, daily_checkins, weekly_reports, analytics_snapshots, micro_challenges, seasonal_modes
- **Edge Functions**: habit-generator (AI), weekly-report (AI), daily-plan (AI), analytics-compute, micro-challenge-generator (AI)
- **Row-Level Security** on all user data tables
- **Authentication** with email/password via Supabase Auth

