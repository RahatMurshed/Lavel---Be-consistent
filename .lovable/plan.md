

# Delete Identity Feature

## Overview

Add the ability to delete an identity from the Identity Alignment page, so users can remove identities they no longer align with or want to change.

---

## What happens when an identity is deleted

- The identity row is removed from the `identities` table
- Any habits linked to that identity will have their `identity_id` set to `null` (they become unlinked, not deleted)
- Any drift alerts for that identity will also be deleted
- The identity card disappears from the dashboard immediately

---

## Changes

### 1. New hook: `useDeleteIdentity` in `src/hooks/useHabits.ts`

A mutation that:
1. Unlinks all habits from the identity (`UPDATE habits SET identity_id = null WHERE identity_id = :id`)
2. Deletes drift alerts for the identity (`DELETE FROM identity_drift_alerts WHERE identity_id = :id`)
3. Deletes the identity row (`DELETE FROM identities WHERE id = :id`)
4. Invalidates `identities`, `all-habits`, `active-habits`, and `identity-drift` query caches

### 2. Delete button on each identity card in `IdentityAlignmentDashboard.tsx`

- Add a small `Trash2` icon button next to the expand/collapse chevron on each identity card
- Clicking it opens a confirmation dialog (using the existing `AlertDialog` component) asking: "Delete [Identity Label]? Linked habits will be kept but unlinked from this identity."
- On confirm, calls `useDeleteIdentity`
- Shows a success toast on completion

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useHabits.ts` | Add `useDeleteIdentity()` mutation |
| `src/components/dashboard/IdentityAlignmentDashboard.tsx` | Add delete button with confirmation dialog on each identity card |

No database migrations needed -- existing RLS policies already allow users to delete their own identities, habits updates, and drift alerts.

