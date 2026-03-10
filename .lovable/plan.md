

## Plan: Add Count Badges to Admin Sidebar Nav Items

### What exists today
The admin sidebar in `AdminLayout.tsx` is a static list of links — no counts or indicators for any section.

### What to build
Add small count badges next to key sidebar items that show pending/actionable counts. These will be fetched with a single lightweight query hook.

**Sections to badge:**
| Nav Item | Count Logic |
|----------|------------|
| Leads | `leads` where `status = 'new'` |
| Applications | `buyer_profiles` where `buyer_id IS NULL` |
| Reviews | `reviews` where `is_verified = false` |
| Spam | `spam_events` from last 24 hours |

### Implementation

**1. New hook: `src/hooks/useAdminCounts.ts`**
- Single hook that runs 4 parallel count queries using `.select('id', { count: 'exact', head: true })`
- Returns `{ leads: number, applications: number, reviews: number, spam: number }`
- Refreshes every 60 seconds via `refetchInterval`
- Only runs when user is admin

**2. Update `src/components/admin/AdminLayout.tsx`**
- Call `useAdminCounts()` at the top
- Map counts to nav item paths (e.g., `/admin` → leads count, `/admin/applications` → applications count)
- Render a small red/primary dot or pill badge next to the label when count > 0
- When sidebar is collapsed, show just a small dot on the icon

### UI
- Badge style: small rounded pill with count, using the existing `Badge` component with `destructive` variant for attention
- When collapsed: a 6px dot positioned top-right of the icon
- Counts of 0 show nothing

### Files to create/edit

| File | Change |
|------|--------|
| `src/hooks/useAdminCounts.ts` | New hook with 4 count queries |
| `src/components/admin/AdminLayout.tsx` | Consume hook, render badges |

