

## Problem

Every component that calls `useSubscription()` creates its own independent state instance. Each starts with `isSubscribed: false` and `isLoading: true`, then independently calls the `check-subscription` edge function. This causes:

1. **Flash of "Upgrade to Pro" badge** on nav items while subscription check is in-flight
2. **UpgradePrompt paywall briefly shown** on gated pages before the async check resolves
3. **Multiple redundant edge function calls** (one per component using the hook) on every page load
4. **Race conditions** where some components resolve before others

## Solution

### 1. Create a shared SubscriptionContext (single source of truth)

Move subscription state into a React Context provider so all components share ONE state instance and ONE edge function call.

**New file: `src/contexts/SubscriptionContext.tsx`**
- Create `SubscriptionProvider` that wraps the app
- Move all logic from `useSubscription` into this provider
- Single `checkSubscription` call shared across the entire app
- Cache the result so navigating between pages doesn't re-trigger checks

**Update `src/hooks/useSubscription.ts`**
- Rewrite to simply consume the context (a thin wrapper)
- All existing imports continue to work with no changes needed in consuming components

### 2. Fix loading state handling across gated pages

Currently gated pages show the `UpgradePrompt` while loading:
```
if (!subLoading && !isPro) return <UpgradePrompt />;
```

This is correct but because each hook instance starts loading independently, there's a brief window where `subLoading` is already `false` (from a stale initial state) before the check even begins. With the shared context, loading starts `true` globally and only becomes `false` once.

### 3. Mount the provider in App.tsx

Wrap the router content with `<SubscriptionProvider>` so all routes and sidebar share the same subscription state.

### 4. Persist last-known subscription status in localStorage

To eliminate the flash on page refresh for paid users:
- Save `isPro` status to `localStorage` after each successful check
- Initialize state from localStorage (optimistic) while the async check runs
- This means paid users see Pro UI immediately, then it gets confirmed by the edge function

## Technical Details

### Files to create:
- `src/contexts/SubscriptionContext.tsx` -- Provider with all subscription logic

### Files to modify:
- `src/hooks/useSubscription.ts` -- Thin wrapper around context
- `src/App.tsx` -- Wrap with `SubscriptionProvider`

### No changes needed in:
- Any page components (Analytics, Groups, Leaderboard, Mirror, Settings, Pricing, etc.)
- AppSidebar
- UpgradePrompt

All consuming components keep using `useSubscription()` exactly as before.

