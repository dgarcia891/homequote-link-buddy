

# Comprehensive Analytics Upgrade

## Overview
Replace the two separate analytics pages (Blog Stats + Site Analytics) with a single, tabbed **Analytics Hub** at `/admin/analytics`. This hub will have four tabs: **Site Traffic**, **Leads**, **Revenue & ROI**, and **Blog**.

All data comes from existing tables (`analytics_events`, `leads`, `buyers`, `post_metrics`, `posts`) — no database changes needed.

## What Gets Built

### 1. Analytics Hub (`/admin/analytics`) — 4 tabs

**Tab 1: Site Traffic** (existing Site Analytics, enhanced)
- Current: page views, visitors, sessions, clicks, conversions, device breakdown, sources, referrers, form funnel
- **Add**: Bounce rate estimate (single-page sessions / total sessions), avg pages per session, landing page performance table (views + conversion rate per page), vertical-filtered traffic breakdown

**Tab 2: Leads** (new)
- Lead volume over time (line chart, filterable by vertical)
- Conversion rate by vertical (bar chart: leads / page views per vertical landing page)
- Lead quality trend (avg lead score + avg AI quality score over time)
- Leads by source/UTM breakdown (which sources produce the most leads)
- Leads by city heatmap-style table
- Form abandonment rate (form_step_1 starts vs form_step_3 completions)

**Tab 3: Revenue & ROI** (new)
- Leads by status funnel: new → routed → accepted → sold (bar chart)
- Buyer performance table: leads received, accepted rate, avg response time per buyer
- Revenue per vertical (count of "sold" leads per vertical)
- Cost-per-lead proxy by source (if GCLID present, flag as paid; show paid vs organic lead counts)
- Top performing service types by conversion

**Tab 4: Blog** (migrated from current BlogAnalytics page)
- Existing blog analytics content moved here as a tab

### 2. Navigation Cleanup
- Remove "Blog Stats" nav item, keep single "Analytics" item pointing to `/admin/analytics`
- Remove old `/admin/site-analytics` route (redirect to `/admin/analytics`)

### 3. File Changes

| Action | File |
|--------|------|
| Rewrite | `src/pages/admin/SiteAnalytics.tsx` → becomes the Analytics Hub with 4 tabs |
| Delete content from | `src/pages/admin/BlogAnalytics.tsx` → redirect to hub |
| Edit | `src/components/admin/AdminLayout.tsx` — consolidate nav items |
| Edit | `src/App.tsx` — update routes |

### Technical Approach
- All computed client-side from existing table queries (no new DB tables or edge functions)
- Each tab is a separate component for code organization, lazy-loaded within the hub
- Date range selector (7d / 30d / 90d) shared across all tabs
- Vertical filter available on Lead and Revenue tabs
- Uses existing recharts library for all charts

