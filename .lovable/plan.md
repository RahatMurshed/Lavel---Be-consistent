
# Add To-Do List and Add Identity Features

## Overview

Two new features for the Dashboard area:

1. **To-Do List** -- A personal task list widget on the Dashboard for quick daily tasks (separate from habits)
2. **Add Identity** -- Allow users to create new identities directly from the Identity page (currently only possible during onboarding)

---

## Feature 1: To-Do List

### Database
Create a new `todos` table:
- `id` (uuid, primary key)
- `user_id` (uuid, not null)
- `title` (text, not null)
- `completed` (boolean, default false)
- `created_at` (timestamptz, default now())
- `completed_at` (timestamptz, nullable)

RLS policy: Users can only CRUD their own todos.

### New Hook: `src/hooks/useTodos.ts`
- `useTodos()` -- fetch all todos for the current user, ordered by created_at desc
- `useAddTodo()` -- insert a new todo
- `useToggleTodo()` -- toggle completed status
- `useDeleteTodo()` -- remove a todo

### UI: To-Do Card in Dashboard Center
Add a new card below the "Today's Habits" section in `DashboardCenter.tsx`:
- Card title: "To-Do List" with a list icon
- Input field at top to type a new task and press Enter to add
- Each todo shows a checkbox, title text, and a delete button
- Completed todos get a strikethrough style and move to the bottom
- Simple, clean, professional look matching the existing glass-card design

---

## Feature 2: Add Identity

### No Database Changes
The `identities` table already supports inserting new rows with `user_id`, `label`, `emoji`, and `color`.

### New Component: `src/components/dashboard/AddIdentityForm.tsx`
A small form (inline or dialog) with:
- **Label** text input (required) -- e.g., "Athlete", "Creator"
- **Emoji** picker -- a simple grid of common emojis or text input
- **Color** selector -- choose from the existing color options (violet, teal, amber, rose, blue, emerald)
- Submit button to insert into the `identities` table

### New Hook Addition in `src/hooks/useHabits.ts`
Add a `useCreateIdentity()` mutation that inserts into the `identities` table and invalidates the `["identities"]` query cache.

### UI Integration in Identity Page
Add an "Add Identity" button at the top of `IdentityAlignmentDashboard.tsx` (next to the header). Clicking it opens a dialog with the `AddIdentityForm`. On success, the new identity card appears in the list immediately.

---

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useTodos.ts` | CRUD hooks for todos table |
| `src/components/dashboard/TodoList.tsx` | To-do list card component |
| `src/components/dashboard/AddIdentityForm.tsx` | Identity creation form in a dialog |

### Modified Files
| File | Change |
|------|--------|
| `src/components/dashboard/DashboardCenter.tsx` | Import and render `TodoList` below habits |
| `src/hooks/useHabits.ts` | Add `useCreateIdentity()` mutation |
| `src/components/dashboard/IdentityAlignmentDashboard.tsx` | Add "Add Identity" button and dialog |

### Database Migration
One migration to create the `todos` table with RLS policies.
