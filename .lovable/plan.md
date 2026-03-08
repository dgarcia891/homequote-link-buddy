

# Lead Nurturing System: Confirmation + Follow-up + Feedback

## Overview
Build an automated lead nurturing email flow triggered when a lead is dispatched to a buyer. Three emails in the sequence:

1. **Immediate confirmation** — sent to the lead when "Send Lead to Buyer" is clicked, telling them their info was sent to [Business Name]
2. **Follow-up check-in** (configurable delay, default 2 days) — asking the lead if they connected with the plumber
3. **Feedback/review request** (configurable delay, default 5 days) — asking for a review, whether they hired the plumber, and general feedback

## Database Changes (migration)

### New table: `lead_nurture_emails`
Tracks scheduled and sent nurture emails per lead.

```sql
CREATE TABLE public.lead_nurture_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  email_type text NOT NULL, -- 'confirmation', 'follow_up', 'feedback_request'
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'sent', 'cancelled'
  feedback_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_nurture_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage nurture emails" ON public.lead_nurture_emails FOR ALL USING (is_admin()) WITH CHECK (is_admin());
```

### New table: `lead_feedback`
Stores homeowner feedback responses.

```sql
CREATE TABLE public.lead_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  hired_plumber boolean,
  rating integer, -- 1-5
  review_text text,
  token text NOT NULL UNIQUE, -- secure token for unauthenticated access
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_feedback ENABLE ROW LEVEL SECURITY;
-- Admins can read all
CREATE POLICY "Admins can manage feedback" ON public.lead_feedback FOR ALL USING (is_admin()) WITH CHECK (is_admin());
-- Public can update their own via token (handled by edge function)
```

## Edge Functions

### 1. `send-lead-confirmation` (new)
Called from LeadDetail when "Send Lead to Buyer" is clicked. Does three things:
- Sends immediate confirmation email to the lead's email address
- Schedules follow-up and feedback emails in `lead_nurture_emails`
- Creates a secure feedback token in `lead_feedback`

Email content: "Hi [Name], we've shared your request with [Business Name]. They should reach out to you shortly."

### 2. `send-nurture-emails` (new, cron-triggered)
Runs on a schedule (every hour). Queries `lead_nurture_emails` for rows where `status = 'scheduled'` and `scheduled_at <= now()`. For each:
- **follow_up**: "Hi [Name], just checking in — did [Business Name] reach out about your [service_type] request?"
- **feedback_request**: "Hi [Name], we'd love your feedback. Did you end up going with [Business Name]?" with a link to a feedback form page

### 3. `submit-feedback` (new)
Public endpoint (no auth). Accepts a token + feedback data (hired?, rating, review text). Updates `lead_feedback` and logs a lead event.

## Frontend Changes

### `src/pages/admin/LeadDetail.tsx`
- When "Send Lead to Buyer" succeeds, also invoke `send-lead-confirmation` to trigger the nurture sequence
- Add a "Nurture Emails" section showing scheduled/sent emails for this lead
- Add a "Feedback" section showing any submitted feedback

### `src/pages/Feedback.tsx` (new public page)
- Simple form accessible via `/feedback?token=xxx`
- Fields: "Did you hire them?" (yes/no), rating (1-5 stars), review text
- Submits to the `submit-feedback` edge function
- No auth required — secured by the unique token

### `src/App.tsx`
- Add route for `/feedback`

## Email Templates
All emails use the existing `htmlWrapper` pattern from `notify-admin-email` for consistent branding. The nurture emails will be sent through the same SMTP config.

## Cron Setup
Schedule `send-nurture-emails` to run hourly via `pg_cron` + `pg_net`.

## Files to create/modify
- **Migration** for `lead_nurture_emails` and `lead_feedback` tables
- **`supabase/functions/send-lead-confirmation/index.ts`** — new
- **`supabase/functions/send-nurture-emails/index.ts`** — new
- **`supabase/functions/submit-feedback/index.ts`** — new
- **`src/pages/Feedback.tsx`** — new public feedback form
- **`src/pages/admin/LeadDetail.tsx`** — integrate confirmation trigger + show nurture/feedback status
- **`src/App.tsx`** — add `/feedback` route
- **`supabase/config.toml`** — add new functions with `verify_jwt = false`

