

# Add In-App Feature Guide and Workflow Walkthrough

## Problem

After onboarding, new users land on the Dashboard with 7 navigation items (Dashboard, Identity, Habits, Skills, Analytics, AI Mirror, Groups) and multiple widgets (Drift Monitor, Morning Check-in, Micro Challenge) -- but there's zero explanation of what anything does or how features connect. Users are left guessing.

## Solution: Two-Part Guidance System

### Part 1: Post-Onboarding Feature Tour (First-Time Only)

A step-by-step guided walkthrough that appears once -- right after onboarding completes and the user reaches the Dashboard for the first time.

**How it works:**
- A modal/spotlight overlay walks through 5-6 key areas
- Each step highlights a UI element and explains its purpose in plain language
- User clicks "Next" to proceed or "Skip" to dismiss
- A `tour_completed` flag on the `profiles` table prevents it from showing again

**Tour Steps:**
1. **Dashboard** -- "This is your daily command center. Log your habits here each day."
2. **Morning Check-in** -- "Rate your energy each morning. The app adapts your targets based on how you feel."
3. **Identity sidebar** -- "These are the identities you chose. The % shows how aligned your actions are."
4. **Habits page** -- "Manage your habit stack. Each habit has a Full version and a Minimum version for low-energy days."
5. **Analytics** -- "Your performance report. See completion rates, streaks, and trends over any time period."
6. **AI Mirror** -- "Get AI-powered reflections on your consistency patterns and personalized coaching."

### Part 2: Persistent "How It Works" Help Panel

A small help button (?) in the header that opens a quick-reference drawer/dialog explaining:

- **The Workflow**: Identity -> Habits -> Daily Logging -> Analytics -> AI Coaching
- **Key Concepts**: What "Full vs Min" means, what Consistency Score measures, what Identity Drift is
- **Page Descriptions**: One-liner for each nav item

This is always accessible, not just on first visit.

---

## Technical Details

### Database Change
Add a `tour_completed` boolean column to the `profiles` table (default `false`). After the tour finishes or is skipped, set it to `true`.

### New Files

| File | Purpose |
|------|---------|
| `src/components/dashboard/FeatureTour.tsx` | Step-by-step spotlight tour component using framer-motion for transitions. Renders a semi-transparent overlay with a highlighted card pointing to each feature area. |
| `src/components/dashboard/HelpDrawer.tsx` | A sheet/drawer component triggered by a "?" button. Contains the workflow diagram, concept glossary, and page descriptions. |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Import and render `FeatureTour` when `profile.tour_completed === false`. Add the "?" help button to the header. |
| `src/components/DashboardLayout.tsx` | Add the "?" help button to the header for non-Dashboard pages. |

### Tour Component Design

The `FeatureTour` will be a lightweight overlay component:
- Uses a `step` state (0-5) to track progress
- Each step shows a card with a title, description, and icon
- Includes "Next", "Back", and "Skip Tour" buttons
- On completion or skip, calls `supabase.from('profiles').update({ tour_completed: true })`
- Uses framer-motion `AnimatePresence` for smooth step transitions
- Does NOT use a third-party tour library -- built from scratch to match the existing glass-card design system

### Help Drawer Content

The help drawer will contain three sections:

**Section 1 -- Your Workflow**
A visual step-by-step:
```
Define Identity -> Build Habits -> Log Daily -> Review Analytics -> Get AI Coaching
```

**Section 2 -- Key Concepts**
- **Full vs Min versions**: Full is the ideal version of a habit. Min is the bare minimum for low-energy days. Both count as completed.
- **Consistency Score**: A multi-dimensional score based on completion ratio, trend stability, recovery speed, resilience, and energy alignment.
- **Identity Drift**: When your recent habit completion drops significantly compared to your baseline, the app alerts you and generates a recovery plan.
- **Morning Check-in**: Your daily energy level (1-10) determines whether the app suggests full or minimum habit versions.
- **Friction Triggers**: When you miss a habit, you can log why. The app tracks these to identify patterns.

**Section 3 -- Pages**
- **Dashboard**: Daily overview with momentum chart, consistency gauge, and habit logging
- **Identity**: Manage your chosen identities and see alignment percentages
- **Habits**: Add, edit, reorder, and manage your full habit stack
- **Skills**: Track skills you are learning (independent of habits)
- **Analytics**: Professional performance report with charts, tables, and AI insights
- **AI Mirror**: AI-powered weekly reflections and consistency coaching
- **Groups**: Join or create accountability groups with team challenges

### No New Dependencies
Everything built with existing tools: framer-motion for animations, Radix Sheet for the drawer, and Tailwind for styling.
