
## What’s happening (root causes)

### 1) “referral” slice drills into an empty detail view
- The Traffic Sources pie is *labeling* a slice as `"referral"` when `utm_source` is empty but `referrer` exists:
  - `source = utm_source || (referrer ? "referral" : "direct")`
- But the drill-down URL currently uses `filterKey=utm_source&filterValue=referral`.
- In the database there are **0** events with `utm_source = 'referral'`, so the detail page filters to nothing.

### 2) Several other drill-down links are likely wrong for the same reason
Common pattern: charts display **derived** values (hostnames, “Direct”, “Mobile”, “direct”), while detail filtering is a strict `item[filterKey] === filterValue` against **raw** columns.
Examples currently broken / inconsistent:
- **Top Referrers**: chart uses hostname; detail uses full `referrer` URL → strict equality won’t match.
- **Blog traffic sources**: chart uses hostname or `"Direct"`; detail has `referrer = null` or full URL → won’t match.
- **Leads by Source**: chart uses `utm_source || source || "direct"` but drilldown filters by `source=direct` while `source` is often null → shows nothing.
- **Form funnel click**: funnel links to `form_completions` while that detail view only contains step-3 submits → clicking step 1/2 shows nothing.

### 3) “IP addresses” not showing
- We are **not storing raw IP addresses**. We store a privacy-safe **`ip_hash`** (non-reversible).
- Also, only **new** events recorded after the tracking change have `ip_hash`. Right now the table has `20` events total and only `1` has `ip_hash`.
- The admin tables for event metrics currently **do not include `ip_hash` as a column**, so even when present you can’t see it.

## Plan to fix drilldowns + audit correctness (implementation)

### A) Add derived fields to the detail dataset (so filters match what charts show)
In `AnalyticsDetail.tsx`, before applying the filter:
- For `analytics_events` rows add:
  - `traffic_source`: `utm_source ?? (referrer ? "referral" : "direct")`
  - `referrer_host`: hostname from `referrer` URL, else `"Direct"`
  - `device_type`: `"Mobile" | "Tablet" | "Desktop"` based on `screen_width`
- For `post_metrics` rows add:
  - `referrer_host`: hostname from `referrer`, else `"Direct"`
- For `leads` rows add:
  - `lead_source`: `utm_source ?? source ?? "direct"`

Then update the filter logic so it filters against these derived keys when they’re used in URLs.

### B) Fix the click URLs in every tab to use derived filter keys consistently
Update drill-downs to:
- **Traffic Sources pie** → `filterKey=traffic_source` (NOT `utm_source`)
- **Top Referrers table** → `filterKey=referrer_host` (NOT `referrer`)
- **Device Breakdown pie** → make it clickable and drill down via `filterKey=device_type`
- **Leads by Source** → `filterKey=lead_source` (NOT `source`)
- **Blog traffic sources** → `filterKey=referrer_host` (NOT `referrer`)

Also update the underlying counts so they’re computed from the same base dataset as the target detail view:
- Traffic Sources + Devices should be computed from **page_view events** (not all events) since they drill into `/page_views`.

### C) Fix the form funnel drilldown so Step 1/2 clicks aren’t empty
Add a new metric in `AnalyticsDetail.tsx`:
- `form_steps`: shows **all** `event_type="form_step"` events
Update the funnel bars to link to `/admin/analytics/form_steps?filterKey=event_name&filterValue=...`

(Keep `form_completions` as “step-3 submit only” for KPI accuracy.)

### D) Make `ip_hash` visible in the Admin detail tables
- Add `ip_hash` as a selectable column to **generic event** metrics (page_views/clicks/conversions/form_steps/etc).
- Optionally include `ip_hash` in “Visitors” and “Sessions” derived rows using the first event’s `ip_hash` (best-effort).
- Add derived columns (traffic_source/referrer_host/device_type/lead_source) as available columns (default hidden unless explicitly needed).

### E) Fix the table column toggles so new columns don’t unexpectedly appear (and can be hidden correctly)
`ConfigurableTable` currently:
- Doesn’t merge saved column visibility with new columns’ defaults.
- Makes first toggle on a new column ineffective (because `!undefined === true`).
We’ll:
- Merge stored visibility with column defaults for missing keys.
- Toggle based on “currently visible” (`prev[key] !== false`) so a single click properly hides a column.

### F) Improve IP extraction robustness (so new events reliably get `ip_hash`)
Update `track-event` to check common forwarded IP headers in order:
- `cf-connecting-ip`, `x-real-ip`, `x-forwarded-for` (first IP), etc.
Even if headers are missing, it should still produce a non-null hash (fallback), so we always populate `ip_hash` for newly recorded events.

## Files to change
- `src/pages/admin/AnalyticsDetail.tsx`
  - add derived fields, new `form_steps` metric, improved filtering, add columns (`ip_hash`, derived keys)
  - ensure blog detail respects selected `range` (7/30/90) instead of hardcoded 30
- `src/components/admin/analytics/SiteTrafficTab.tsx`
  - fix traffic source drilldown key, make device pie clickable, compute sources/devices from page_views, fix referrer drilldown key, funnel drilldown to `form_steps`
- `src/components/admin/analytics/LeadsTab.tsx`
  - drilldown by `lead_source` instead of `source`
- `src/components/admin/analytics/BlogTab.tsx`
  - drilldown by `referrer_host` instead of `referrer`
- `src/components/admin/ConfigurableTable.tsx`
  - merge stored visibility with defaults; fix toggle behavior
- `supabase/functions/track-event/index.ts`
  - more robust IP header extraction

## How we’ll verify (end-to-end)
1) Generate a new visit with a known referrer and verify:
- Traffic Sources shows “referral: 1”
- Clicking it opens Page Views with rows shown (filterKey=traffic_source&filterValue=referral)
2) Click Top Referrers hostname and confirm it filters correctly via `referrer_host`.
3) Click Device Breakdown slice and confirm it filters via `device_type`.
4) Click Leads by Source “direct” and confirm it shows leads (via `lead_source`).
5) Confirm Page Views (and other event metrics) can display `ip_hash` and that **newly created events** show a value (older ones will remain blank).
