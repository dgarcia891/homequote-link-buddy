

# Clickable KPI Cards with Detail Pages

## Overview
Make each KPI card in the Site Traffic tab clickable. Clicking a card navigates to a detail page showing the full list of underlying events with all available fields.

## What Gets Built

### 1. Detail Page (`src/pages/admin/AnalyticsDetail.tsx`)
- Route: `/admin/analytics/:metric` where metric is one of: `page_views`, `visitors`, `sessions`, `clicks`, `conversions`, `bounce`, `pages_per_session`
- Fetches from `analytics_events` table filtered by the selected date range (passed via URL search params)
- Displays a full-width table with all columns: timestamp, event type, event name, page path, referrer, visitor ID, session ID, UTM source/medium/campaign, GCLID, user agent, screen size, metadata
- For "visitors" — groups by visitor_id showing first seen, last seen, event count, pages visited
- For "sessions" — groups by session_id showing start time, page count, duration estimate, bounce status
- For "bounce" — shows only single-page sessions
- For "pages_per_session" — shows session breakdown with page counts
- Includes a back button to return to the analytics hub
- Sortable columns, search/filter input

### 2. Updated KPI Card (`KpiCard.tsx`)
- Add optional `href` prop
- Wrap card in a `<Link>` when href is provided, with hover styling (cursor-pointer, subtle border highlight)

### 3. Updated SiteTrafficTab
- Pass `href` to each KpiCard pointing to `/admin/analytics/:metric?range=30d`

### 4. Route Registration (`App.tsx`)
- Add protected route for `/admin/analytics/:metric`

## File Changes

| Action | File |
|--------|------|
| Create | `src/pages/admin/AnalyticsDetail.tsx` |
| Edit | `src/components/admin/analytics/KpiCard.tsx` — add `href` prop + Link wrapper |
| Edit | `src/components/admin/analytics/SiteTrafficTab.tsx` — pass `href` to each KpiCard |
| Edit | `src/App.tsx` — add route |

