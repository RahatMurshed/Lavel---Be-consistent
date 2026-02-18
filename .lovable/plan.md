
# Clarify Consistency Metrics

## Overview
Improve the Consistency Gauge on the dashboard to ensure the 5 metrics (Completion, Stability, Recovery, Resilience, and Energy) are clearly labeled and explained, resolving the confusion about what the side numbers represent.

## Technical Details

### 1. Update Consistency Gauge UI (`src/components/dashboard/ConsistencyGauge.tsx`)
- Increase the label width and remove `truncate` to ensure full names are visible.
- Add a small `Info` icon with a `Tooltip` (using Radix UI Tooltip component) for each metric that explains what it means:
    - **Completion**: Percentage of habits logged as Full or Minimum.
    - **Stability**: Measures the consistency of your daily volume.
    - **Recovery**: How fast you return to a habit after a missed day.
    - **Resilience**: Your performance on days when energy is 4 or lower.
    - **Energy Alignment**: Your performance on days when energy is 7 or higher.
- Adjust the layout to ensure labels don't get squeezed on mobile or smaller cards.

### 2. Rename Resilience to "Flexibility"
- Since the user is seeing an "F" label in their current view (possibly from a previous version or specific build), I will standardize the label to "Flexibility" if it helps clarity, or ensure "Resilience" is fully spelled out. I'll stick to **Flexibility** as it often resonates better with the "Minimum Version" feature.

### Files Modified
- `src/components/dashboard/ConsistencyGauge.tsx`: UI layout and label updates.
- `src/hooks/useConsistencyScore.ts`: (Optional) Update internal key names if needed for clarity, though it's mostly a UI change.

