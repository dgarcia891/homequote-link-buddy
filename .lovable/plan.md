

# Clickable Charts — Navigate to Filtered Detail Reports

## Overview
Make all bar charts, pie charts, and table rows across the analytics tabs clickable. Clicking a segment/bar/row navigates to the corresponding detail report with a filter query parameter pre-applied.

## How It Works

### 1. Add filter support to `AnalyticsDetail.tsx`
Read optional `filterKey` and `filterValue` query params (e.g. `?filterKey=utm_source&filterValue=google`). After fetching data, apply the filter to narrow results. Display active filter as a removable badge.

### 2. Make charts clickable in each tab

**SiteTrafficTab.tsx**:
- Traffic Sources pie → `/admin/analytics/page_views?filterKey=utm_source&filterValue={source}`
- Device Breakdown pie → `/admin/analytics/page_views?filterKey=device&filterValue={name}` (derive device from screen_width in detail page)
- Funnel bars → `/admin/analytics/form_completions?filterKey=event_name&filterValue={step_event}`
- Top Referrers table rows → `/admin/analytics/page_views?filterKey=referrer&filterValue={domain}`
- Landing Page table rows → `/admin/analytics/page_views?filterKey=page_path&filterValue={page}`
- Button Clicks table rows → `/admin/analytics/clicks?filterKey=event_name&filterValue={name}`

**LeadsTab.tsx**:
- Leads by Vertical bars → `/admin/analytics/leads_all?filterKey=vertical&filterValue={vertical}`
- Leads by Source bars → `/admin/analytics/leads_all?filterKey=source&filterValue={source}`
- Top Cities table rows → `/admin/analytics/leads_all?filterKey=city&filterValue={city}`

**RevenueTab.tsx**:
- Status Funnel bars → `/admin/analytics/leads_all?filterKey=status&filterValue={status}`
- Paid vs Organic bars → `/admin/analytics/leads_paid` or `leads_all` with paid filter
- Sold by Vertical bars → `/admin/analytics/leads_sold?filterKey=vertical&filterValue={vertical}`

**BlogTab.tsx**:
- Top Posts list items → `/admin/analytics/blog_views?filterKey=post_id&filterValue={postId}`
- Traffic Sources bars → `/admin/analytics/blog_views?filterKey=referrer&filterValue={source}`

### 3. Implementation approach
- Use `useNavigate` in each tab component
- For Recharts: add `onClick` handler to `Pie`/`Bar` components and `Cell` elements, plus `cursor: pointer` styling
- For table rows: wrap in `Link` or add `onClick` + `cursor-pointer`
- In `AnalyticsDetail.tsx`: parse `filterKey`/`filterValue` from search params, filter the data array, show a badge with "Filtered by {key}: {value}" and an X to clear

## File Changes

| Action | File |
|--------|------|
| Modify | `src/pages/admin/AnalyticsDetail.tsx` — add filterKey/filterValue query param support |
| Modify | `src/components/admin/analytics/SiteTrafficTab.tsx` — add click handlers to pie charts, bars, table rows |
| Modify | `src/components/admin/analytics/LeadsTab.tsx` — add click handlers to bars, table rows |
| Modify | `src/components/admin/analytics/RevenueTab.tsx` — add click handlers to bars, table rows |
| Modify | `src/components/admin/analytics/BlogTab.tsx` — add click handlers to bars, list items |

