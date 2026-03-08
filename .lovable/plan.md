

# Admin IP Exclusion from Analytics

## Overview
Add a toggle in Admin Settings to exclude the current browser from all analytics tracking, plus the ability to store excluded `visitor_id`s in `admin_settings` so historical and cross-device filtering can be applied when viewing analytics.

## How It Works

### 1. Prevention — Stop Recording Admin Traffic
In `analyticsService.ts`, check `localStorage` for an `hql_ignore_tracking` flag before inserting any event. If set to `"true"`, skip the insert entirely. Same check added to the blog `track-view` call path (the component that calls the edge function).

### 2. Settings Toggle
Add an "Analytics Exclusions" section to `Settings.tsx` with:
- A **Switch** labeled "Exclude this browser from analytics" — sets `hql_ignore_tracking` in `localStorage`
- On toggle-on, also saves the current `visitor_id` to an `admin_settings` row (`setting_key = "excluded_visitors"`) so it can be filtered retroactively
- On toggle-off, removes the visitor_id from that list

### 3. Retroactive Filtering in Dashboard
In `SiteAnalytics.tsx` and `AnalyticsDetail.tsx`, fetch the `excluded_visitors` list from `admin_settings` and filter out matching `visitor_id` rows from `analytics_events` data before computing KPIs and rendering tables. Blog `post_metrics` filtering will use `session_id` matching against excluded visitor sessions.

### 4. Blog View Tracking
Update `usePageTracking.ts` (or wherever the blog track-view edge function is called) to skip the call when `hql_ignore_tracking` is set.

## File Changes

| Action | File | Change |
|--------|------|--------|
| Modify | `src/services/analyticsService.ts` | Early return if `hql_ignore_tracking` flag is set |
| Modify | `src/hooks/usePageTracking.ts` | Early return if flag set (covers blog views too) |
| Modify | `src/pages/admin/Settings.tsx` | Add "Exclude this browser" toggle + save visitor_id to `admin_settings` |
| Modify | `src/pages/admin/SiteAnalytics.tsx` | Fetch excluded_visitors, filter events/blogMetrics before passing to tabs |
| Modify | `src/pages/admin/AnalyticsDetail.tsx` | Fetch excluded_visitors, filter data |

