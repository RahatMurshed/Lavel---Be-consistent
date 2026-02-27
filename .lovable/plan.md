

# Implement Stripe SaaS Payments for Lavel

## Overview
Turn Lavel into a real SaaS with a Free/Pro pricing model, Stripe subscription checkout, subscription status checks, and feature gating throughout the app.

## Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 identity, 3 habits, basic dashboard, manual logging |
| **Pro** | $9/month | Unlimited identities and habits, AI Mirror, AI Coach, Analytics, Groups, Leaderboard, Notifications, Data Export |

## Implementation Steps

### 1. Create Stripe Products and Prices
- Create a **Lavel Pro** product with a $9/month recurring price using Stripe tools
- Store the `price_id` and `product_id` as constants in the frontend

### 2. Create 3 Edge Functions

**`create-checkout`** -- Creates a Stripe Checkout session in subscription mode for the Pro plan. Looks up existing Stripe customer by email, redirects to Stripe-hosted checkout.

**`check-subscription`** -- Verifies if the authenticated user has an active Stripe subscription. Returns `{ subscribed, product_id, subscription_end }`. Called on login, page load, and periodically.

**`customer-portal`** -- Creates a Stripe Customer Portal session so users can manage billing, cancel, or update payment methods.

### 3. Create Subscription Context (`src/hooks/useSubscription.ts`)
- React hook that calls `check-subscription` on auth state change and every 60 seconds
- Exposes `isSubscribed`, `isLoading`, `subscriptionEnd`, and `checkSubscription()` to the app
- Provides a `requirePro()` helper that shows an upgrade prompt instead of blocking

### 4. Build Pricing Page (`src/pages/Pricing.tsx`)
- Two-tier pricing cards (Free vs Pro) with feature comparison
- CTA button that calls `create-checkout` and redirects to Stripe
- Accessible from landing page nav, sidebar, and upgrade prompts
- Route: `/pricing`

### 5. Feature Gating
- Wrap premium features (AI Mirror, Analytics, Groups, Leaderboard, advanced AI features) with a subscription check
- Free users see a soft paywall overlay with "Upgrade to Pro" CTA
- Sidebar shows a small "Upgrade" badge next to gated features for free users

### 6. Add Subscription Management to Dashboard
- Add "Manage Subscription" option in the sidebar or header for Pro users
- Calls `customer-portal` edge function and opens Stripe portal
- Show subscription status badge (Free / Pro) in sidebar

### 7. Update Landing Page
- Add "Pricing" link in the top nav
- Update CTA to "Start Free" with a note about Pro

### 8. Success Page (`src/pages/PaymentSuccess.tsx`)
- Simple confirmation page after checkout
- Auto-refreshes subscription status and redirects to dashboard

## Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/create-checkout/index.ts` | Stripe checkout session |
| `supabase/functions/check-subscription/index.ts` | Verify subscription status |
| `supabase/functions/customer-portal/index.ts` | Stripe billing portal |
| `src/hooks/useSubscription.ts` | Subscription state hook |
| `src/pages/Pricing.tsx` | Pricing page with plan cards |
| `src/pages/PaymentSuccess.tsx` | Post-checkout success page |
| `src/components/UpgradePrompt.tsx` | Reusable paywall overlay |

## Files to Modify
| File | Change |
|------|--------|
| `src/App.tsx` | Add routes for `/pricing` and `/payment-success` |
| `src/pages/Index.tsx` | Add Pricing nav link, update CTAs |
| `src/components/AppSidebar.tsx` | Show plan badge + upgrade button for free users |
| `src/pages/Mirror.tsx` | Gate behind Pro |
| `src/pages/Analytics.tsx` | Gate behind Pro |
| `src/pages/Groups.tsx` | Gate behind Pro |
| `src/pages/Leaderboard.tsx` | Gate behind Pro |
| `supabase/config.toml` | Add new edge function entries with `verify_jwt = false` |

