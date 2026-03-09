

# Add Extra Visitor Metadata to Analytics

## Summary
Add 6 new data fields to every analytics event: language, timezone, page title, full URL, connection type, and touch support.

## Database migration
Add 6 new nullable text columns to `analytics_events`:

```sql
ALTER TABLE public.analytics_events
  ADD COLUMN language text,
  ADD COLUMN timezone text,
  ADD COLUMN page_title text,
  ADD COLUMN page_url text,
  ADD COLUMN connection_type text,
  ADD COLUMN is_touch_device boolean;
```

## Client-side (`src/services/analyticsService.ts`)
Collect 6 new fields in `trackEvent()` and send them in the request body:
- `navigator.language`
- `Intl.DateTimeFormat().resolvedOptions().timeZone`
- `document.title`
- `window.location.href`
- `(navigator as any).connection?.effectiveType || null`
- `navigator.maxTouchPoints > 0`

## Edge function (`supabase/functions/track-event/index.ts`)
Accept the 6 new fields from the payload and insert them into the database.

## Admin UI (`src/pages/admin/AnalyticsDetail.tsx`)
Add columns for all 6 new fields across the relevant metric views (visitors, sessions, page_views, etc.). Most will default to `visible: false` to keep the table clean, with language and timezone visible by default.

## Files changed
| File | Change |
|---|---|
| Database migration | Add 6 columns |
| `src/services/analyticsService.ts` | Collect 6 new browser fields |
| `supabase/functions/track-event/index.ts` | Accept + insert new fields |
| `src/pages/admin/AnalyticsDetail.tsx` | Add columns to detail tables |

