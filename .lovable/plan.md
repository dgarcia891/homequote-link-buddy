

## Plan: Purge Analytics by IP + Ignore Lovable Preview Views

### What exists today
- Settings page has an "Exclude this browser" toggle that sets a localStorage flag and stores the visitor ID in `excluded_visitors` admin setting
- Analytics dashboards filter out excluded visitor IDs client-side
- The `track-event` edge function stores `ip_address` on each `analytics_events` row
- The `analyticsService.ts` client sends `page_url` with every event (full URL including domain)

### What to build

**1. "Purge my analytics records" button (Settings page)**
- Add a button in the Analytics Exclusions card: "Purge My Records"
- On click, calls a new edge function `purge-analytics` that:
  - Receives the caller's visitor_id
  - Deletes all rows from `analytics_events` where `visitor_id` matches
  - Returns the count of deleted rows
- Shows a confirmation dialog before purging, then a toast with the count

**2. "Ignore Lovable preview views" toggle (Settings page)**
- Add a second switch: "Exclude Lovable preview views"
- Persists to `admin_settings` with key `exclude_preview_views` (boolean)
- The `track-event` edge function checks this setting; if enabled, it rejects inserts where the referrer or page_url contains `lovableproject.com` or `lovable.app`
- The analytics dashboard also filters these out client-side as a fallback (checking `page_url` for those domains)

### Database changes
- Add an RLS policy allowing service-role deletes on `analytics_events` (the edge function uses service role, so no migration needed — service role bypasses RLS)

### Files to create/edit

| File | Change |
|------|--------|
| `supabase/functions/purge-analytics/index.ts` | New edge function: delete by visitor_id, return count |
| `supabase/config.toml` | Add `[functions.purge-analytics]` with `verify_jwt = false` |
| `supabase/functions/track-event/index.ts` | Check `exclude_preview_views` setting; reject lovable domain requests |
| `src/pages/admin/Settings.tsx` | Add purge button with confirmation + preview exclusion toggle |
| `src/pages/admin/SiteAnalytics.tsx` | Also filter out lovable preview URLs client-side when setting is enabled |

### UI in Settings

The Analytics Exclusions card will have three controls:
1. **Exclude this browser** (existing toggle)
2. **Purge my analytics records** — destructive button with alert dialog showing "This will permanently delete all analytics events from your visitor ID"
3. **Exclude Lovable preview views** — toggle that filters out any events from `*.lovableproject.com` or `*.lovable.app` domains

