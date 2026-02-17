
# Motivational Quotes System -- Full Consistency Reinforcement

## Overview
Add motivational quotes across the entire sign-in flow (Auth page, Onboarding steps) using an expanded curated library, and create an AI-powered personalized motivation system on the dashboard that generates quotes based on the user's actual behavior data (streak, completion rate, identities, energy, burnout risk).

---

## What Already Exists
- Auth page has 3 rotating quotes with fade animation -- needs expansion
- Onboarding has no quotes at all
- Dashboard has no daily motivation card
- Habit logging toasts are plain text, no motivational reinforcement
- Edge function `habit-generator` exists as a pattern reference
- `LOVABLE_API_KEY` secret is already configured

---

## Part 1: Curated Quotes Library

Create `src/lib/quotes.ts` with:

- `AUTH_QUOTES` -- 15+ consistency-themed quotes with attribution for the Auth page rotating display
- `ONBOARDING_QUOTES` -- 4 themed quotes (one per step):
  - Step 0 (Welcome): About starting and identity
  - Step 1 (Identity): About becoming who you want to be
  - Step 2 (Outcomes): About goals and systems
  - Step 3 (Review): About taking action
- `ACTION_TOASTS` -- motivational toast messages categorized by action type:
  - `full`: 5+ encouraging messages for completing habits fully
  - `min`: 5+ supportive messages for minimum completions
  - `miss`: 5+ compassionate messages for logging friction

---

## Part 2: Expand Auth Page Quotes

Update `src/pages/Auth.tsx`:
- Replace the 3 hardcoded quotes with the expanded `AUTH_QUOTES` array from the quotes library
- Keep the existing 6-second rotation with AnimatePresence fade animation
- No structural changes needed -- just swap the data source

---

## Part 3: Add Quotes to Onboarding Steps

Update `src/pages/Onboarding.tsx`:
- Add a contextual quote at the bottom of each step, below the navigation buttons
- Each step displays its themed quote from `ONBOARDING_QUOTES`
- Styled as italic, muted text with a subtle fade-in animation
- Quote changes with each step transition

---

## Part 4: AI-Powered Daily Motivation Edge Function

Create `supabase/functions/motivational-quote/index.ts`:
- Accepts POST with user behavior data: `{ streak, completionRate, identities, burnoutRisk, energy, recentMisses }`
- Uses Lovable AI (`google/gemini-3-flash-preview`) to generate a personalized 1-2 sentence motivational message
- System prompt: "You are a consistency coach. Based on the user's data, write a short, powerful motivational message (1-2 sentences). Be warm, specific to their situation, and focused on consistency over perfection."
- Returns `{ quote: string }`
- Handles 429/402 errors, falls back gracefully
- Update `supabase/config.toml` to register the function with `verify_jwt = false`

---

## Part 5: Daily Motivation Dashboard Component

Create `src/components/dashboard/DailyMotivation.tsx`:
- Positioned at the top of `DashboardRight`
- Uses React Query with key `["daily-motivation", todayDateString]` to fetch once per day (staleTime: 24 hours)
- Collects user context from existing hooks (useConsistencyScore, useStreak, useActiveHabits, useTodayCheckin, useBurnoutRisk)
- When user has behavior data (logs exist): calls `motivational-quote` edge function
- When user is new (no data): shows a random curated quote from `AUTH_QUOTES`
- Glass card with a sparkle/quote icon, italic premium typography
- Loading skeleton while fetching

Update `src/components/dashboard/DashboardRight.tsx`:
- Import and render `DailyMotivation` at the top of the aside, before Morning Check-in

---

## Part 6: Motivational Toasts on Habit Logging

Update `src/components/dashboard/DashboardCenter.tsx`:
- Replace plain toast messages with randomized motivational messages from `ACTION_TOASTS`
- "Full" log: `toast.success(randomFullMessage)` -- e.g., "Full send! You're becoming who you said you'd be."
- "Min" log: `toast.success(randomMinMessage)` -- e.g., "Showing up matters more than intensity."
- "Miss" friction: `toast.info(randomMissMessage)` -- e.g., "Awareness is the first step to recovery."

---

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/lib/quotes.ts` | Curated quotes library with AUTH_QUOTES, ONBOARDING_QUOTES, ACTION_TOASTS |
| `supabase/functions/motivational-quote/index.ts` | AI edge function for personalized daily motivation |
| `src/components/dashboard/DailyMotivation.tsx` | Dashboard card showing daily AI-generated or curated quote |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Import quotes from library instead of hardcoded array |
| `src/pages/Onboarding.tsx` | Add themed quote display at bottom of each step |
| `src/components/dashboard/DashboardRight.tsx` | Add DailyMotivation card at top |
| `src/components/dashboard/DashboardCenter.tsx` | Replace plain toast messages with motivational variants |
| `supabase/config.toml` | Register motivational-quote function |

### Edge Function Details
- Model: `google/gemini-3-flash-preview` (fast, cost-effective)
- Uses tool calling to extract structured `{ quote: string }` response
- Prompt includes user's streak count, completion rate, identity labels, energy level, and burnout risk
- Graceful fallback to curated quotes on any AI error
