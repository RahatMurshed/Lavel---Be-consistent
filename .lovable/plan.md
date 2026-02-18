

# Smart To-Do System: AI Suggestions, Priority Levels, and Burnout Protection

## Overview

Transform the basic To-Do List into an intelligent task management system that:
- Uses AI to suggest tasks based on your habits and skills
- Adds priority levels so you always know what to tackle first
- Warns you when your plate is too full (burnout risk)
- Automatically highlights your most impactful task of the day
- Adds several high-value features to make the app genuinely useful

---

## Feature 1: Priority Levels

Every todo gets a priority: **Critical**, **Important**, or **Bonus**.

- **Critical** (red dot) -- Tasks you must do today. These appear at the top, bolded, with a highlight.
- **Important** (amber dot) -- Meaningful but not urgent. Shown after critical tasks.
- **Bonus** (gray dot) -- Nice-to-have. These move to the bottom.

When adding a task, users pick a priority via 3 small buttons next to the input. Default is "Important."

The list auto-sorts: Critical first, then Important, then Bonus. Completed tasks sink to the bottom within each group.

### "Highlight the Hardest" Nudge
The single most impactful incomplete task (the first Critical todo, or the oldest Important if no Critical exists) gets a subtle glow border and a small tag: "Tackle this first." This encourages doing the hardest/most important thing before anything else -- without ever naming the methodology.

---

## Feature 2: Burnout Risk Indicator for Todos

A small warning banner appears inside the To-Do card when you have too many active tasks:

| Active Incomplete Todos | Indicator |
|---|---|
| 0-5 | None (healthy) |
| 6-8 | Yellow: "You have a full plate. Consider moving some tasks to Bonus priority." |
| 9+ | Red: "Overloaded! Focus on your Critical tasks and defer the rest." |

This uses simple client-side counting -- no AI needed.

---

## Feature 3: AI-Powered Task Suggestions

A "Suggest Tasks" button (sparkle icon) in the To-Do card header calls an edge function that analyzes the user's:
- Current habits and their completion rates
- Skills they're learning
- Existing todos (to avoid duplicates)
- Today's energy level

The AI returns 3-5 actionable task suggestions, each with a title, priority level, and category. These appear as suggestion chips below the input. Users can tap a chip to instantly add it as a todo.

### How it works:
1. User clicks the sparkle button
2. Frontend sends habits, skills, current todos, and energy to a new `todo-suggester` edge function
3. Edge function calls Lovable AI with tool calling to get structured suggestions
4. Suggestions appear as tappable cards with an "Add" button

### Suggestion Logic:
- If a user has skills but no related practice tasks, suggest practice sessions
- If habits are being missed, suggest preparation tasks (e.g., "Prepare gym clothes tonight")
- If energy is low, suggest lighter tasks
- If the user has few or no todos, proactively suggest high-impact tasks aligned with their identities
- Never suggest tasks that duplicate existing todos

---

## Feature 4: Additional High-Value Features

### 4a. Daily Focus Mode
At the top of the To-Do card, show a "Today's Focus" section that auto-selects the top Critical task. This task gets a dedicated highlight card with a timer-style display showing how long ago it was created (urgency signal).

### 4b. Task Completion Stats
A small footer in the To-Do card showing:
- "3 of 7 done today" with a mini progress bar
- Completion percentage

### 4c. Quick Reschedule
A small clock icon on each todo that, when clicked, moves the task to Bonus priority and dims it -- effectively saying "not today." This prevents guilt from unfinished tasks without deleting them.

---

## Technical Details

### Database Migration
Add `priority` and `category` columns to the `todos` table:

```text
ALTER TABLE public.todos ADD COLUMN priority TEXT NOT NULL DEFAULT 'important';
ALTER TABLE public.todos ADD COLUMN category TEXT;
```

No new tables needed.

### New Edge Function: `supabase/functions/todo-suggester/index.ts`

Accepts:
- `habits` (name, completion rate, identity)
- `skills` (name, category)
- `currentTodos` (titles, to avoid duplicates)
- `energy` (today's energy level, nullable)

Uses Lovable AI with tool calling to return structured suggestions:
```text
{
  suggestions: [
    { title: "...", priority: "critical" | "important" | "bonus", category: "habit-support" | "skill-practice" | "wellness" | "planning" }
  ]
}
```

Config update in `supabase/config.toml`:
```text
[functions.todo-suggester]
verify_jwt = false
```

### Modified Hook: `src/hooks/useTodos.ts`

- Update the `Todo` interface to include `priority` and `category`
- Update `useAddTodo` to accept `{ title, priority, category? }` instead of just a string
- Add a new `useAISuggestTodos` mutation that calls the `todo-suggester` edge function
- Update `useToggleTodo` (no changes needed)
- Sorting logic: priority order (critical > important > bonus), then completed last, then by date

### Modified Component: `src/components/dashboard/TodoList.tsx`

Major rewrite to include:
- Priority selector (3 small buttons) next to the input
- "Suggest Tasks" sparkle button in the card header
- AI suggestion chips section (shown after clicking suggest)
- Burnout warning banner (based on active todo count)
- "Tackle this first" highlight on the top critical task
- Color-coded priority dots on each todo
- Completion stats footer ("3 of 7 done")
- Quick reschedule (clock icon) to demote a task to Bonus

### No Changes to `DashboardCenter.tsx`
TodoList is already imported and rendered there.

### Files Summary

| Action | File |
|---|---|
| Create | `supabase/functions/todo-suggester/index.ts` |
| Modify | `supabase/config.toml` (add todo-suggester) |
| Migrate | `todos` table (add priority, category columns) |
| Modify | `src/hooks/useTodos.ts` (priority support, AI suggest hook) |
| Modify | `src/components/dashboard/TodoList.tsx` (full rewrite with all new features) |

