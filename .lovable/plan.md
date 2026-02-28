

# HomeQuoteLink MVP — Final Build Plan

## 1. Supabase Database Setup

### Migration: Create all tables with triggers and RLS

**Tables:**

- **leads** — id, created_at, updated_at, full_name, phone, phone_normalized, email, email_normalized, zip_code, city, service_type, urgency, description, preferred_contact_method, consent_to_contact, vertical (default 'plumbing'), source, utm_source, utm_medium, utm_campaign, gclid, landing_page, referrer, status (default 'new'), assigned_buyer_id (FK → buyers), lead_score, duplicate_flag (default false), spam_flag (default false), is_test (default false), review_reason, notes
- **buyers** — id, created_at, updated_at, business_name, contact_name, email, phone, service_areas (text[]), supported_service_types (text[]), vertical (default 'plumbing'), is_active (default true), daily_lead_cap, notes
- **lead_events** — id, lead_id (FK → leads), event_type, event_detail, created_at, **created_by_user_id** (uuid, nullable, FK → auth.users(id) ON DELETE SET NULL)
- **routing_settings** — id, created_at, updated_at, city, service_type, buyer_id (FK → buyers), vertical (default 'plumbing'), is_active (default true), max_daily_leads, business_hours (jsonb), after_hours_behavior

**Trigger:** `set_updated_at()` function applied to leads, buyers, routing_settings — automatically maintains updated_at on every UPDATE.

**RLS Policies:**
- leads: anon INSERT only; authenticated SELECT + UPDATE (no DELETE)
- buyers: authenticated full CRUD
- lead_events: authenticated SELECT + INSERT
- routing_settings: authenticated full CRUD

---

## 2. Foundation — Types, Constants, Services

- **Types** (`src/types/index.ts`): Lead, Buyer, LeadEvent, RoutingSetting interfaces
- **Constants** (`src/lib/constants.ts`): SCV cities, service types, urgency levels, lead statuses, contact methods
- **Supabase client** setup in `src/integrations/supabase/`
- **Placeholder services** (`src/services/`): webhookService, leadScoringService, duplicateDetectionService, buyerAssignmentService — all clearly labeled stubs

---

## 3. Public Pages

- **Shared components**: Header, Footer, CTAButton, HowItWorks, ServiceCard
- **Homepage** (`/`): Hero with CTA to /plumbing/santa-clarita, How It Works, service areas, common services grid, footer
- **Landing page** (`/plumbing/santa-clarita`): Reusable PlumbingCityLanding template driven by city data object. Conversion-focused with lead form above fold, click-to-call, FAQ, trust copy, repeated CTA. Only Santa Clarita content built; data structure ready for future cities.
- **Thank You** (`/thank-you`): Confirmation, expectation setting, urgency guidance, link home
- **SEO**: PageMeta component for title + meta description per page

---

## 4. Lead Capture Form

- react-hook-form + Zod validation
- All visible fields (name, phone, email, zip, city, service type, urgency, description, contact method, consent)
- Auto-capture UTM params, gclid, landing_page, referrer via useTrackingParams hook
- Compute phone_normalized and email_normalized client-side
- Insert to Supabase leads table → redirect to /thank-you → toast on error
- Call placeholder service stubs on submission

---

## 5. Admin CRM

- **Login** (`/admin/login`): Email/password via Supabase Auth
- **Protected route wrapper**: Redirects unauthenticated users to login
- **Admin layout**: Collapsible sidebar (Leads, Buyers, Routing), header with logout
- **Leads Dashboard** (`/admin`): Sortable/filterable table, search, click to detail. No delete — archive via status.
- **Lead Detail** (`/admin/leads/:id`): Full fields + metadata, status selector, manual buyer assignment, notes, lead_events timeline, duplicate/spam/is_test toggles, review_reason. Inserts lead_events with created_by_user_id from session.
- **Buyers** (`/admin/buyers`): Table + add/edit dialog
- **Routing** (`/admin/routing`): Table + add/edit dialog — config for future automation only

---

## 6. Hooks

- useAuth, useLeads, useBuyers, useRouting, useTrackingParams, useLeadEvents

