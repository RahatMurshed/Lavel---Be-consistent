

# Premium UI Overhaul -- Modern Icons + Premium AI Product Feel

## Overview
Replace generic Lucide icons with premium alternatives across the entire app. Elevate the design system with refined gradients, micro-interactions, improved typography hierarchy, and polished glass-morphism effects to create a premium AI product experience.

---

## Icon Upgrades

### Onboarding Identity Cards
Replace plain emoji icons with premium styled emoji in gradient-backed containers:
- Builder: Hammer icon in a violet gradient circle
- Athlete: Dumbbell icon in a teal gradient circle
- Reader: BookOpen icon in a blue gradient circle
- Creator: Palette icon in a rose gradient circle
- Leader: Crown icon in an amber gradient circle
- Mindful: Leaf icon in an emerald gradient circle

Each identity card gets a gradient icon container with a soft glow, similar to the reference screenshot but more refined.

### Auth Page
- Replace the generic Zap logo with a custom SVG sparkle/diamond mark with gradient fill
- Add a subtle animated gradient ring around the logo

### Dashboard Header
- Replace Zap with the same premium brand mark
- Upgrade LogOut icon styling

### Sidebar Navigation
- Replace generic icons with more distinctive ones:
  - Dashboard: LayoutGrid (instead of LayoutDashboard)
  - Habits: Flame (instead of Target)
  - Analytics: TrendingUp (instead of BarChart3)
  - Daily Plan: Compass (instead of Calendar)
  - AI Mirror: Sparkles (instead of Brain)

### Dashboard Cards
- Streak card: Replace Target with a custom flame/streak icon
- Burnout Risk: Replace AlertTriangle with ShieldAlert
- Morning Check-in: Replace Sun with Sunrise
- AI Mirror: Replace Brain with BrainCircuit
- Micro Challenge: Replace Sparkles with Rocket

### Landing Page
- Upgrade feature icons with gradient backgrounds in pill containers
- Replace Zap logo with premium brand mark

---

## Design System Refinements

### Glass Cards Enhancement
- Increase backdrop blur to 16px
- Add subtle inner border highlight (top-left light edge)
- Slightly increase border opacity for better definition

### Gradient Accents
- Add a subtle gradient overlay to primary buttons (violet to blue shift)
- Identity cards get a hover micro-glow animation
- Stats cards get a colored top-border accent line (2px gradient)

### Typography Polish
- Auth page title: increase to text-4xl with tighter letter spacing
- Onboarding step titles: add gradient text effect on key words
- Dashboard section headers: add a small colored dot before the title

### Button Upgrades
- Primary buttons: gradient background (primary to slightly shifted hue)
- Ghost buttons: add subtle border on hover
- Habit action buttons (Full/Min/Miss): pill-shaped with icon prefix

### Micro-interactions
- Identity card selection: scale(1.02) + ring glow animation
- Energy slider buttons: smooth color transition on hover
- Habit log buttons: subtle bounce on click via framer-motion

---

## Technical Details

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/Onboarding.tsx` | Premium icon containers for identity cards, gradient text, refined card styles, better spacing |
| `src/pages/Auth.tsx` | Premium brand mark SVG, enhanced card styling, gradient button |
| `src/pages/Dashboard.tsx` | Premium brand mark in header, refined header styling |
| `src/pages/Index.tsx` | Premium brand mark, gradient feature icon containers, hero text gradient |
| `src/components/AppSidebar.tsx` | Updated nav icons, refined identity card styling |
| `src/components/dashboard/DashboardCenter.tsx` | Updated stat card icons with gradient containers, refined habit cards, pill-shaped action buttons |
| `src/components/dashboard/DashboardRight.tsx` | Updated card icons, refined energy slider, enhanced micro-challenge card |
| `src/index.css` | New utility classes: `.gradient-text`, `.glass-card-premium`, `.icon-container`, `.btn-gradient` |
| `src/components/ui/PremiumIcon.tsx` | New -- reusable gradient icon container component |

### New Component: PremiumIcon
A reusable wrapper that renders any Lucide icon inside a gradient-backed rounded container with configurable color themes (violet, teal, amber, rose, blue, emerald).

### CSS Additions
- `.gradient-text`: `background: linear-gradient(...)` with `background-clip: text`
- `.glass-card-premium`: enhanced glass card with inner highlight border
- `.icon-container`: gradient circle/rounded-square for icon display
- `.btn-gradient`: gradient primary button style

