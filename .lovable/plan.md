

# Multi-Vertical Readiness Assessment & Plan

## Current State

**Database: Ready.** The `leads`, `buyers`, and `routing_settings` tables already have a `vertical` column defaulting to `'plumbing'`. No schema changes needed for basic multi-vertical support.

**Application code: Not ready.** Plumbing is hardcoded in ~34 files across constants, scoring logic, public pages, email templates, and edge functions.

## What Needs to Change

### 1. Vertical-aware constants (`src/lib/constants.ts`)
Replace the flat `SERVICE_TYPES` array with a vertical-keyed map:
```ts
export const VERTICALS = {
  plumbing: { label: "Plumbing", serviceTypes: ["Drain Cleaning", "Water Heater", ...] },
  hvac: { label: "HVAC / AC", serviceTypes: ["AC Repair", "Furnace Install", "Duct Cleaning", ...] },
  landscaping: { label: "Yard & Landscaping", serviceTypes: ["Lawn Care", "Tree Trimming", ...] },
} as const;
```

### 2. Lead scoring per vertical (`leadScoringService.ts`)
Move scoring weights into a per-vertical config so "AC Repair" can score differently than "Drain Cleaning."

### 3. Lead capture form (`LeadCaptureForm.tsx`)
Add a vertical selector (or derive it from the landing page URL). Service type dropdown dynamically filters based on selected vertical.

### 4. Vertical-specific landing pages
Create a pattern like `/services/hvac`, `/services/landscaping` that mirrors the current plumbing landing page but with vertical-appropriate copy, icons, and service cards. Could use a shared template component with vertical config passed in.

### 5. Provider directory & reviews
Filter `/providers` by vertical. Show vertical badge on provider cards. Buyers' `supported_service_types` already exists as an array — just needs to be populated per vertical.

### 6. Email templates (edge functions)
Replace hardcoded "plumber" references with the vertical's label pulled from the lead record. ~5 edge functions need updates.

### 7. Admin UI
- Add vertical filter to Leads, Buyers, and Routing pages
- Let admins configure service types per vertical (or use the constants map)
- Dashboard stats filterable by vertical

### 8. Public pages (Index, FAQ, Footer)
Make the homepage either vertical-agnostic ("Find a Home Service Pro") or keep plumbing as the primary with links to other vertical landing pages.

## Recommended Approach: Phased

**Phase 1 — Foundation (do now)**
- Refactor `constants.ts` to vertical-keyed structure
- Update `LeadCaptureForm` to accept a vertical prop
- Update `leadScoringService` to use per-vertical weights
- Add vertical filter to admin Leads/Buyers pages
- Update edge function email templates to use `lead.vertical` instead of hardcoded "plumber"

**Phase 2 — New vertical landing pages**
- Create a reusable `ServiceLanding` template component
- Build `/services/hvac` and `/services/landscaping` pages using it
- Add vertical-specific FAQ content
- Update JsonLd schema to support multiple service types

**Phase 3 — Full multi-vertical**
- Homepage becomes a service selector or hub
- Provider directory filters by vertical
- Vertical-specific review categories
- Admin settings page to manage verticals and their service types dynamically (stored in DB instead of constants)

## Scope Estimate
- Phase 1: ~15 files modified, no DB migration needed
- Phase 2: ~8 new files, light migration for vertical metadata
- Phase 3: 1 new DB table (`verticals` config), ~10 files

Would you like me to proceed with Phase 1 to lay the multi-vertical foundation?

