

# Configurable Data Tables with Column Visibility & Full Data

## Overview
Replace the hardcoded table views in `AnalyticsDetail.tsx` with a single, generic configurable table component. Every view will expose ALL available fields, let admins toggle column visibility, and make every column sortable.

## What Gets Built

### 1. Reusable `ConfigurableTable` Component (`src/components/admin/ConfigurableTable.tsx`)
- Accepts a column definition array: `{ key, label, defaultVisible, render? }`
- Column visibility dropdown (popover with checkboxes) — persisted to `localStorage` per metric key
- All columns sortable via click on header
- Search across all fields (existing behavior)
- Renders only visible columns

### 2. Full Field Exposure per View

**Events** (page_views, clicks, conversions, form_completions, form_abandonment): Add `user_agent`, `metadata` columns (currently omitted).

**Visitors**: Add `user_agent` (from first event), `referrer`, `utm_source`, `screen_width×screen_height`.

**Sessions/Bounce/Pages-per-Session**: Add `referrer`, `user_agent`, `utm_source`, `pages_list`.

**Leads**: Add `zip_code`, `description`, `ai_authenticity_score`, `ai_authenticity_reason`, `landing_page`, `referrer`, `utm_medium`, `utm_campaign`, `notes`, `duplicate_flag`, `spam_flag`, `assigned_buyer_id`, `preferred_contact_method`. All lead table columns exposed.

**Blog Views**: Add `ip_hash`, `post_slug` columns.

**Blog Posts**: Add `meta_description`, `featured_image_url`, `status`.

### 3. Column Definitions Structure
```text
┌──────────────────────────────────────┐
│  [Columns ▾]  Search...             │
│  ┌────────────────────┐              │
│  │ ☑ Time             │              │
│  │ ☑ Type             │              │
│  │ ☐ User Agent       │              │
│  │ ☑ Page Path        │              │
│  │ ☐ Metadata         │              │
│  └────────────────────┘              │
│                                      │
│  Table with only checked columns     │
└──────────────────────────────────────┘
```

### 4. File Changes

| Action | File |
|--------|------|
| Create | `src/components/admin/ConfigurableTable.tsx` |
| Rewrite | `src/pages/admin/AnalyticsDetail.tsx` — replace 6 hardcoded tables with column definitions + `ConfigurableTable` |

### Technical Details
- `ConfigurableTable` props: `columns: ColumnDef[]`, `data: any[]`, `storageKey: string`, `searchValue: string`
- Column def: `{ key: string; label: string; visible: boolean; render?: (value: any, row: any) => ReactNode }`
- Visibility state stored in `localStorage` under `hql_cols_{storageKey}` as a JSON object of `{ [key]: boolean }`
- Sorting is handled inside the component (sort state + toggle)
- The popover uses existing Popover + Checkbox components from the UI library

