

# Disable Email Verification + Comprehensive Feature Tour

## Overview

Two changes:

1. **Disable email verification** so new signups can log in immediately (for testing)
2. **Expand the Feature Tour** to cover all app features including the newer ones (Skills, Groups, Leaderboard, Seasonal Modes, Todos)

---

## 1. Disable Email Verification

### Auth Configuration
- Use the `configure-auth` tool to enable auto-confirm for email signups so users skip the email verification step

### Frontend Change (`src/pages/Auth.tsx`)
- After successful signup, navigate directly to `/dashboard` instead of showing the "Check your email" toast

---

## 2. Expanded Feature Tour

### Current Tour Steps (6 steps)
The existing tour covers: Dashboard, Morning Check-in, Identity Alignment, Habits, Analytics, AI Mirror

### Updated Tour Steps (10 steps)
Add coverage for all features in the sidebar nav:

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | LayoutDashboard | Dashboard | Daily command center for logging habits and tracking momentum |
| 2 | Sun | Morning Check-in | Rate your energy; the app adapts habit versions accordingly |
| 3 | Fingerprint | Identity Alignment | Track how your actions align with who you're becoming |
| 4 | ListChecks | Habits | Manage your Full and Minimum habit versions |
| 5 | BookOpen | Skills | Track skills you're learning and get AI recommendations |
| 6 | BarChart3 | Analytics | Professional performance reports with trends and breakdowns |
| 7 | Trophy | Leaderboard | Compete with others globally or within your groups |
| 8 | Users | Groups | Join or create accountability groups with shared challenges |
| 9 | Brain | AI Mirror | AI-powered reflections, coaching, and corrective plans |
| 10 | Leaf | Seasonal Modes | Switch between Push, Maintain, and Recovery modes based on your life season |

### File Changes

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | On signup success, navigate to `/dashboard` instead of showing email confirmation toast |
| `src/components/dashboard/FeatureTour.tsx` | Add 4 new tour steps for Skills, Leaderboard, Groups, and Seasonal Modes |

### Auth Config
- Auto-confirm email signups enabled via configure-auth tool

