

# Partial Leads Visibility + Spam Blocklist System

## Issue: Partial leads not showing
The "Partial / Abandoned" tab exists in the dashboard but the `LEAD_STATUSES` constant doesn't include `"partial"`, so the status filter dropdown won't show it. However, the `useLeads` hook does handle `includePartial` correctly — the tab should work. Need to verify if partial leads exist in the database or if the progressive save is failing silently.

## Changes

### 1. Add "spam" status + "Mark as Spam" button on Lead Detail
- Add `"spam"` to `LEAD_STATUSES` in `src/lib/constants.ts`
- Add a prominent "Mark as Spam" button on the Lead Detail page that:
  - Sets lead status to `"spam"`
  - Adds the lead's email and phone to new blocklist tables
  - Logs a lead event

### 2. Create blocklist tables (migration)
```sql
CREATE TABLE public.blocked_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL UNIQUE,
  source_lead_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blocked_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_normalized text NOT NULL UNIQUE,
  source_lead_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
With RLS: admins can SELECT/INSERT/DELETE, public cannot access.

### 3. Block spam contacts on lead submission
- In `LeadCaptureForm.tsx`, before the progressive save and before final submit, check the `blocked_emails` and `blocked_phones` tables
- If matched, show a generic error ("Unable to submit your request. Please call us directly.") without revealing the block reason
- Since anonymous users can't SELECT from these tables with admin-only RLS, create a small edge function `check-blocklist` that accepts email/phone and returns `{blocked: true/false}`

### 4. Add spam color to dashboard
- Add `spam: "bg-red-200 text-red-900"` to `statusColors` in Dashboard.tsx

### 5. Debug partial leads
- Check if partial leads exist in the DB; if the tab shows "No leads found" it may simply be that none have been captured yet (form requires both valid phone + email before saving partial)

## Files to modify
- `src/lib/constants.ts` — add "spam" status
- `src/pages/admin/LeadDetail.tsx` — add "Mark as Spam" button
- `src/pages/admin/Dashboard.tsx` — add spam status color
- `src/components/forms/LeadCaptureForm.tsx` — check blocklist before save
- `supabase/functions/check-blocklist/index.ts` — new edge function
- Migration for `blocked_emails` and `blocked_phones` tables

