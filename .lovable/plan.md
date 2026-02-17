

# Theme Color Change -- Consistency-Reflected Palette

## Overview
Shift the primary color from the current violet (258 62% 63%) to a deep teal-cyan that reflects consistency -- steady, calm, trustworthy, and progressive. The secondary accent shifts to a warm indigo for contrast. This creates a color story: teal = steady consistency, indigo = aspiration.

---

## New Primary Color: Deep Teal (180 65% 48%)

The teal family represents reliability, steady growth, and calm focus -- the visual metaphor for consistency. The gradient accent shifts from teal to a cool indigo for depth.

---

## CSS Variable Changes (`src/index.css`)

| Variable | Current (Violet) | New (Teal/Consistency) |
|----------|-------------------|------------------------|
| `--primary` | 258 62% 63% | 180 65% 48% |
| `--accent` | 258 62% 63% | 180 65% 48% |
| `--ring` | 258 62% 63% | 180 65% 48% |
| `--glow-primary` | 258 62% 63% | 180 65% 48% |
| `--chart-violet` | 258 62% 68% | 180 60% 55% |
| `--chart-blue` | 215 70% 62% | 220 65% 58% |
| `--sidebar-primary` | 258 62% 63% | 180 65% 48% |
| `--sidebar-ring` | 258 62% 63% | 180 65% 48% |

Background and card tones shift slightly cooler to complement teal:
| Variable | Current | New |
|----------|---------|-----|
| `--background` | 228 14% 7% | 200 18% 7% |
| `--card` | 228 16% 10% | 200 18% 10% |
| `--secondary` | 228 16% 14% | 200 16% 14% |
| `--muted` | 228 14% 16% | 200 14% 16% |
| `--border` | 228 14% 18% | 200 14% 18% |
| `--glass-bg` | 228 16% 12% | 200 18% 12% |
| `--glass-border` | 228 14% 22% | 200 14% 22% |

---

## PremiumIcon Theme Updates (`src/components/ui/PremiumIcon.tsx`)

Update the "violet" (default) theme's HSL values from 258-based to 180-based teal:
- `violet` becomes the teal primary: `from-[hsl(180,65%,48%)]` to `[hsl(220,65%,58%)]`

---

## BrandMark SVG Updates (`src/components/ui/BrandMark.tsx`)

Update gradient stop colors from violet hues to teal hues to match the new primary.

---

## Glow-Pulse Keyframe (`tailwind.config.ts`)

Update the hardcoded `hsl(258 62% 63%)` in the `glow-pulse` keyframe to `hsl(180 65% 48%)`.

---

## Files Modified

| File | Change |
|------|--------|
| `src/index.css` | Update all CSS custom property values to teal-based palette |
| `src/components/ui/PremiumIcon.tsx` | Update default "violet" theme HSL values to teal |
| `src/components/ui/BrandMark.tsx` | Update SVG gradient colors to teal |
| `tailwind.config.ts` | Update hardcoded HSL in glow-pulse keyframe |

