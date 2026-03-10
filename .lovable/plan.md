

## Plan: Add Bulk Spam Management to Leads Dashboard

### Current State
- The leads list view (`Dashboard.tsx`) has no way to select multiple leads or perform bulk actions
- Marking a lead as spam requires opening the individual lead detail page and using the "Spam Controls" section
- The lead detail page already has full spam logic: updates status to "spam", sets `spam_flag`, and adds email/phone to blocklists

### What to Build
Add checkbox-based multi-select to the leads table with a bulk action bar that appears when leads are selected. The primary action: "Mark as Spam" — which updates all selected leads to spam status, flags them, and adds their emails/phones to blocklists.

### Implementation

**File: `src/pages/admin/Dashboard.tsx`**

1. Add a `selectedIds` state (`Set<string>`) to `AdminDashboard`
2. Add a checkbox column to `LeadsTable`:
   - Header checkbox for select-all on current page
   - Row checkbox for individual selection (stops click propagation so it doesn't navigate)
3. Add a floating bulk action bar that appears when `selectedIds.size > 0`:
   - Shows count: "3 leads selected"
   - "Mark as Spam" button (destructive) — with confirmation dialog
   - "Clear" button to deselect all
4. Bulk spam action logic:
   - Update all selected leads: `status = 'spam', spam_flag = true`
   - Collect all emails/phones from selected leads and upsert into `blocked_emails` / `blocked_phones`
   - Show truthful toast: "Marked 3 leads as spam. Blocked 2 emails, 3 phones."
   - Clear selection and invalidate queries

### UI Layout
```text
┌──────────────────────────────────────────────┐
│ ☐ │ Date │ Name │ Phone │ ... │ Status │     │  ← checkbox column added
│ ☑ │ ...  │ ...  │ ...   │ ... │ new    │     │
│ ☑ │ ...  │ ...  │ ...   │ ... │ new    │     │
└──────────────────────────────────────────────┘

┌─── Floating bar (when selected) ────────────┐
│  2 leads selected   [Mark as Spam] [Clear]  │
└─────────────────────────────────────────────┘
```

### Files to Edit

| File | Change |
|------|--------|
| `src/pages/admin/Dashboard.tsx` | Add selection state, checkbox column, bulk action bar, spam mutation with confirmation dialog |

Single file change — all logic stays in the Dashboard component.

