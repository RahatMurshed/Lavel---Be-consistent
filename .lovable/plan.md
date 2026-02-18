
# Fix Dashboard Card Sizing

## Problem
The three top stat cards (Consistency, Day Streak, Burnout Risk) are in a 3-column grid, but the Consistency card contains a large circular gauge + 5 metric bars, making it visually dominate. The Streak and Burnout cards only show a single number and look tiny by comparison.

## Solution
Restructure the stats row layout so the Consistency card gets its own appropriate space, and the Streak + Burnout cards are properly sized to match.

### Layout Change (`src/components/dashboard/DashboardCenter.tsx`)
- Change the grid from `grid-cols-3` (equal thirds) to a **2-column layout**: Consistency card takes ~60% width, and Streak + Burnout stack vertically in the remaining ~40%
- Use `grid-cols-1 sm:grid-cols-5` with the Consistency card spanning 3 columns (`col-span-3`) and a nested stack for Streak + Burnout spanning 2 columns (`col-span-2`)
- The Streak and Burnout cards will stack vertically with `flex flex-col gap-4` and each card will use `flex-1` to fill equal vertical space, making them feel more substantial

### Consistency Gauge Adjustment (`src/components/dashboard/ConsistencyGauge.tsx`)
- Reduce the gauge circle size from `w-32 h-32` to `w-28 h-28` to keep it proportionate within its card
- Tighten padding so the card doesn't feel oversized

### Visual Result
```text
+-----------------------------+------------------+
|                             |   Day Streak     |
|   Consistency Gauge         |                  |
|   [circle] + 5 bars         +------------------+
|                             |   Burnout Risk   |
|                             |                  |
+-----------------------------+------------------+
```

## Files Modified
| File | Change |
|------|--------|
| `src/components/dashboard/DashboardCenter.tsx` | Restructure stats grid to 2-column layout with Streak/Burnout stacked vertically |
| `src/components/dashboard/ConsistencyGauge.tsx` | Slightly reduce gauge circle size for better proportion |
