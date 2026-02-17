

# Premium AI Product UI Overhaul -- Full Design System + Motion Graphics

## Overview
Transform the entire Lavel app into a premium, polished AI product experience with advanced motion graphics, gradient glow animations, floating card effects, neon grid backgrounds, scroll-driven transitions, interactive charts, micro-interactions, and parallax depth -- all while keeping the dark theme.

---

## Part 1: Tailwind Config -- New Keyframes & Animations

Add the following to `tailwind.config.ts`:

- `float` keyframe: subtle Y-axis bob (translateY -4px to 4px) over 6s, for floating cards
- `glow-pulse` keyframe: opacity + box-shadow pulse on gradient buttons/headers
- `slide-up` keyframe: translateY(30px) + opacity 0 to visible, for scroll-triggered sections
- `slide-in-left` / `slide-in-right` keyframes for staggered content entry
- `shimmer` keyframe: background-position shift for loading/accent shimmer effects
- `gradient-shift` keyframe: hue rotation on gradient backgrounds (subtle 360deg over 8s)
- `bounce-subtle` keyframe: small scale bounce (1 to 1.05 to 1) for icon interactions

Register all as named animations with appropriate durations and easing.

---

## Part 2: CSS Utilities (`src/index.css`)

New utility classes:

- `.neon-grid-bg`: CSS-only animated grid background using repeating linear gradients with very faint primary-colored lines, slow position animation for futuristic feel
- `.glow-text`: text-shadow with primary color glow (for hero headings)
- `.hover-float`: on hover, translateY(-4px) + enhanced box-shadow
- `.shimmer-border`: animated border gradient that shifts position continuously
- `.parallax-slow` / `.parallax-fast`: will-change transform hints for parallax layers
- `.ripple`: CSS radial gradient pseudo-element that expands on click
- Enhanced `.glass-card-premium`: add transition for box-shadow on hover (glow intensifies)
- `.btn-gradient`: add animated gradient-shift on hover + glow-pulse

---

## Part 3: Landing Page (`src/pages/Index.tsx`) -- Full SaaS Redesign

Transform from a basic hero+features page into a full modern SaaS landing page:

**Section 1 -- Hero (viewport height)**
- Animated neon grid background behind everything
- Two parallax glow orbs (primary + teal) moving at different speeds via framer-motion `useScroll` + `useTransform`
- Badge pill fades in first, then headline with gradient text + glow-text effect, then subtitle, then CTA button -- all staggered with framer-motion
- CTA button: `btn-gradient` with `glow-pulse` animation, hover ripple effect
- Below CTA: small "trusted by X+ users" social proof line (placeholder)

**Section 2 -- AI Capabilities Showcase (6 blocks)**
- Each capability in its own card-based block with:
  - `PremiumIcon` (gradient icon container)
  - Title + micro-description
  - Framer-motion `whileInView` fade+slide from alternating left/right
- Capabilities: Identity Engine, Adaptive Planning, Friction Analysis, Consistency Score, AI Mirror, Momentum Tracking
- Cards use `glass-card-premium` with `hover-float` effect
- Staggered entrance: 0.1s delay between each card

**Section 3 -- Interactive Momentum Curve Preview**
- A decorative animated area chart (hardcoded sample data) showing a rising consistency curve
- Uses Recharts `AreaChart` with gradient fill + animated stroke
- framer-motion `whileInView` to trigger the chart drawing animation
- Caption: "Watch your consistency compound over time"

**Section 4 -- How It Works (3-step flow)**
- Horizontal numbered steps: 1. Declare Identity -> 2. Build Habits -> 3. Track & Adapt
- Each step is a glass card with PremiumIcon + description
- Connected by a gradient line between steps
- Smooth slide-up entrance via `whileInView`

**Section 5 -- CTA Footer**
- Large gradient text headline: "Start building who you're becoming"
- Gradient CTA button with glow
- Subtle background glow orb

**Navigation**
- Sticky nav with backdrop-blur, hidden border that appears on scroll
- BrandMark + "Lavel" gradient text
- Sign In button with ghost style, gradient on hover

---

## Part 4: Auth Page (`src/pages/Auth.tsx`) -- Premium Polish

- Add neon grid background (subtle, behind everything)
- BrandMark gets continuous slow `gradient-shift` animation on its glow ring
- Auth card: `shimmer-border` effect (animated gradient border)
- Inputs: subtle focus ring animation (glow pulse on focus)
- Submit button: `btn-gradient` with `glow-pulse` on hover
- Add a rotating motivational quote below the card (prep for future quote system) -- for now just cycle through 3 hardcoded quotes with fade transition every 6 seconds

---

## Part 5: Onboarding (`src/pages/Onboarding.tsx`) -- Motion Polish

- Progress bar dots: animate width change with spring physics via framer-motion
- Identity cards: `hover-float` effect + on selection, glow ring animates in with scale spring
- Step transitions: use `AnimatePresence` with slide+fade (already partially done, enhance with spring physics)
- Generate button: add shimmer effect while generating (animated gradient background)
- Review habit cards: staggered entrance animation (each card slides up 0.08s after previous)

---

## Part 6: Dashboard -- Micro-Interactions & Polish

**AppSidebar**
- Identity cards: `hover-float` on hover
- Progress bars: animate width on mount with CSS transition (already done, ensure smooth)
- Nav items: add subtle left-border accent (2px gradient) on active state

**DashboardCenter**
- Stats row cards: entrance animation with stagger (0.1s between each)
- Consistency Gauge SVG: animate `strokeDashoffset` on mount (CSS transition already there, enhance with longer duration)
- Momentum Chart: add gradient-shift animation on the area fill
- Habit cards: `hover-float` effect
- Full/Min/Miss buttons: `whileTap` scale already done + add ripple CSS pseudo-element
- Section headers: add the colored dot with a subtle pulse animation

**DashboardRight**
- Energy buttons: smooth color transition on hover (already done)
- Cards: `hover-float` effect
- Gradient top-borders: add `shimmer` animation (gradient position shifts slowly)

**FrictionModal**
- Backdrop: add radial gradient glow behind the modal
- Tags: bounce animation when selected

**FrictionSummary**
- Bar widths: animate on mount with staggered CSS transitions
- Replace `AlertTriangle` with `PremiumIcon` using rose theme

---

## Part 7: Component Enhancements

**PremiumIcon** -- Add optional `animated` prop:
- When true, adds slow `float` animation to the icon container
- Adds subtle `glow-pulse` to the shadow

**BrandMark** -- Enhance animated mode:
- Glow ring gets `gradient-shift` animation (colors slowly rotate)
- Inner sparkle SVG gets subtle `float` animation

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add 7 new keyframes + animations (float, glow-pulse, slide-up, shimmer, gradient-shift, bounce-subtle, slide-in-left/right) |
| `src/index.css` | Add 6 new CSS utility classes (neon-grid-bg, glow-text, hover-float, shimmer-border, ripple, enhanced glass/btn styles) |
| `src/pages/Index.tsx` | Full rewrite: 5-section SaaS landing page with parallax, scroll animations, capability showcase, demo chart, how-it-works flow |
| `src/pages/Auth.tsx` | Add neon grid bg, shimmer border on card, rotating quote, enhanced button glow |
| `src/pages/Onboarding.tsx` | Enhanced spring animations, hover-float on identity cards, shimmer on generate button, staggered review cards |
| `src/components/AppSidebar.tsx` | hover-float on identity cards, gradient active border on nav items |
| `src/components/dashboard/DashboardCenter.tsx` | Staggered stat card entrance, hover-float on habit cards, pulse on section dots |
| `src/components/dashboard/DashboardRight.tsx` | hover-float on cards, shimmer on gradient top-borders |
| `src/components/dashboard/FrictionSummary.tsx` | Replace AlertTriangle with PremiumIcon, staggered bar animations |
| `src/components/dashboard/FrictionModal.tsx` | Tag selection bounce, glass-card-premium on dialog |
| `src/components/dashboard/ConsistencyGauge.tsx` | Enhanced stroke animation timing |
| `src/components/ui/PremiumIcon.tsx` | Add optional `animated` prop with float + glow-pulse |
| `src/components/ui/BrandMark.tsx` | Enhanced animated mode with gradient-shift on glow ring |

### Motion Library Usage
- **framer-motion** (already installed): `whileInView`, `useScroll`, `useTransform` for parallax, `AnimatePresence` for transitions, `whileTap`/`whileHover` for micro-interactions, staggered children via `variants`
- **CSS animations** via Tailwind: float, shimmer, glow-pulse, gradient-shift for continuous ambient effects
- **CSS transitions**: hover-float, color transitions, width animations on progress bars

### Performance Considerations
- All parallax uses `will-change: transform` for GPU acceleration
- Neon grid uses CSS only (no JS), repeating-linear-gradient
- Animations use `transform` and `opacity` only (no layout thrashing)
- `whileInView` uses `once: true` to avoid re-triggering
- Charts use `isAnimationActive` prop for controlled animation

